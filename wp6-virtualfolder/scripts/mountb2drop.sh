#!/usr/bin/env bash
# This scripts mounts {localpath} to {url} of webdav service.
# and configures proxy of http://localhost/{webdavuri} to use encoded auth
# Usage:
# - mountb2drop.sh [add|remove] [url] [localpath] [username] [password] [webdavuri]
# - where [alias] is name of subdirectroy under which the webdav is mounted
# Output:
# - {localpath} b2drop or other webdav is mounted using davfs2
# - {webdavuri} proxy configured to use user credentials passed to webdav server
#
# 24.05.2016 tomas - changed directory structure, all mounts will be subdir of 'work', comment owncloudcmd
# 31.01.2017 tomas - refactor, support multiuser, multiple webdav etc.
# 10.09.2018 tomas - need root priviledges, docker compatible

if [ ! -f "/bin/sudo" ]; then
  echo "Warning: \"sudo\" is recommended to be installed. Trying as without it"
  SUDOCMD=""
  SECRETFILE=/etc/davfs2/secrets
else
  echo "unpriviledged environment, need sudo"
  SUDOCMD="/bin/sudo -E"
  SECRETFILE=~/.davfs2/secrets
fi


HTTPD_CONF="/etc/httpd/conf.d/000-default.conf"
HTTPD_SERVICE="httpd"

VF_SKIP_APACHE_CONF=1 #will skip to proxy directly to b2drop or webdav - will go via davfs
#VF_SKIP_APACHE_CONF=0




function checkproxy {
  if [ $http_proxy ]; then    
    if grep -q "^proxy" /etc/davfs2/davfs2.conf ; then
       echo "proxy already set"
    else
       echo "proxy $http_proxy" | ${SUDOCMD} tee -a /etc/davfs2/davfs2.conf
    fi
  fi
}

function checkargs {
  if [[ $1 == http* ]]; then
     echo -n "url OK"
  else
     echo url needs to be in form http:// or https://
     echo -$1:$2:$3:***:$5-
     help
     exit
  fi
  if [ -z $2 ]; then
     echo missing localpath needs to be set
     echo -$1:$2:$3:***:$5-
     help
     exit
  fi
  if [ -z $3 ]; then
     echo missing username needs to be set
     echo -$1:$2:$3:***:$5-
     help
     exit
  fi
  if [ -z $4 ]; then
     echo missing password/webdavuri needs to be set
     echo -$1:$2:$3:***:$5-
     help
     exit
  fi
  if [ -z $5 ]; then
     if [ $1 == "add" ];then
       echo missing webdavuri
       help
       exit
     fi
  fi
}
function addfstab {  
  # LOCALPATH=`readlink -f $2`
  if grep -q "$1 $2 " /etc/fstab; then
    echo "fstab already set"
  else
    echo "$1 $2 davfs noauto,user,file_mode=666,dir_mode=777 0 0" | ${SUDOCMD} tee -a /etc/fstab > /dev/null
  fi
}

function removefstab {  
  grep -v "$1 $2 " /etc/fstab > /tmp/fstab  && ${SUDOCMD} mv /tmp/fstab /etc/fstab
}

function addsecrets {  
  mkdir -p `dirname ${SECRETFILE}`
  touch ${SECRETFILE}
  if grep -q "$1 $2 " ${SECRETFILE}; then
    echo "secrets already set"
  else
    echo $1 $2 $3 | ${SUDOCMD} tee -a ${SECRETFILE} > /dev/null 
  fi
  chmod go-rwx ${SECRETFILE}
}

function removesecrets {  
  grep -v "$1 $2" ${SECRETFILE} > /tmp/secrets && ${SUDOCMD} mv /tmp/secrets ${SECRETFILE}
  chmod go-rwx ${SECRETFILE}
}

function addapacheproxy {
  removeapacheproxy $2
  if [ $VF_SKIP_APACHE_CONF == 1 ]; then
    echo Skipping apache proxy configuration - workaround for EUDAT issue 11169
  else
  SFILE2=/tmp/secrets2
  echo -n $3:$4 > $SFILE2
  if [ -e $SFILE2 ]; then
    AUTH="$(base64 -w 0 $SFILE2)"
    rm $SFILE2
    # hostname from the url in argument $1 is ${HOST[2]}, fix bug #24
    IFS="/";
    HOSTURL=( $1 )
    HOST=${HOSTURL[2]}
    echo $HOST
    IFS=" ";
    if [[ $HOSTNAME == localhost* ]]; then
        PRESERVELINE= "  #ProxyPreserveHost On"
    else
        PRESERVELINE= "  ProxyPreserveHost On"
    fi
    cat | ${SUDOCMD} tee -a $HTTPD_CONF >/dev/null <<EOL
<Location $2 >
  RequestHeader set Authorization "Basic $AUTH"
  RequestHeader set Host "${HOST}"
  ${PRESERVELINE}
  ProxyPass "$1"
  ProxyPassReverse "$1/"
</Location>
EOL
    service ${HTTPD_SERVICE} reload
  fi
  fi #VF_SKIP_APACHE_CONF
}

function removeapacheproxy {
 
 L1=`grep -n -m 1 "\<Location $1" $HTTPD_CONF | cut -f1 -d:`
 
 if [ -z $L1 ]; then
   echo is unset
 elif [ "$L1" -gt "0" ]; then
   let L2=$L1+6 
   ${SUDOCMD} sed -i "$L1,$L2 d" $HTTPD_CONF
 fi
}

function help {
echo Usage:
echo - mountb2drop.sh [add] [url] [localpath] [username] [password] [webdavuri]
echo - mountb2drop.sh remove [url] [localpath] [username] [webdavuri]
echo - add - will add configuration and mount webdav,
echo - remove - will unmount and remove configuration
echo - [localpath] is name of directroy under which the webdav is mounted
echo - [url] is the url of remote webdav server
echo - [username] [password] are credentials needed to access the webdav service
echo - [password] not needed when remove
echo - [webdavuri] url to proxy directly to the webdavprovider
}

checkargs $2 $3 $4 $5 $6
# some paths containing symbolic link are expanded by davfs and then not associated correctly
LOCALPATH=`readlink -f $3`
if [[ -z "${LOCALPATH// }" ]]; then
  LOCALPATH=$3;
fi

if [ $1 == 'add' ]; then
  echo "Adding $2 $3 localpath:$LOCALPATH"
  checkproxy
  addfstab $2 $LOCALPATH
  addsecrets $LOCALPATH $4 $5
  addapacheproxy $2 $6 $4 $5
  # make dir as normal user not as root
  # sudo, otherwise subsequent directories created with root rights will not be accessible for other processes ${SUDOCMD} 
  mkdir -p $3
  if [ ! -d $3 ]; then
    echo "previous mountpoint is corrupted, trying to unmount"
    ${SUDOCMD} umount $3
  fi
  #user needs to be member of group davfs2
  mount $LOCALPATH
  echo "mounted $3"
  exit
fi

if [ $1 == 'remove' ]; then
  echo "Removing $2 $3"
  #workaround, without sudo doesnt work
  #LOCALPATH=`readlink -f $3`
  ${SUDOCMD} umount $LOCALPATH
  rm -d $3
  removeapacheproxy $5
  removefstab $2 $3
  removesecrets $3 $4
  echo "unmounted $3"
  exit
fi

if [ $1 == 'refresh' ]; then
  echo "Refreshing $2 $3"
  #LOCALPATH=`readlink -f $3`
  if [ ! -d $3 ]; then
    echo "previous mountpoint is corrupted, trying to unmount"
    ${SUDOCMD} umount $3    
  fi  
  #user needs to be member of group davfs2
  mount $LOCALPATH
  echo "refreshed $LOCALPATH"
  exit
fi

help
