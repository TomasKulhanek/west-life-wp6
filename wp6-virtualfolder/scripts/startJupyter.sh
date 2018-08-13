#!/usr/bin/env bash

HTTPD_CONF="/etc/httpd/conf.d/jupyter.conf"
HTTPD_SERVICE="httpd"

function help {
echo Usage:
echo startJupyter.sh add\|remove [username] [port] [proxyurlpart]
echo   add - adds proxy setting and starts jupyter on port
echo   remove - stops jupyter running on port and removes proxy
echo   [username] is existing VF username with some mounted repositories and existing directory /home/vagrant/work/[username]
echo   [port] the jupyter service will listen in this port
echo   [proxyurlpart] the location, which will be reverse proxied to jupyter service
echo
echo   example:
echo   startJupyter.sh vagrant 8901
echo   startJupyter.sh remove 8901
}

function addapacheproxy {
  removeapacheproxy $2
  # hostname from the url in argument $1 is ${HOST[2]}, fix bug #24
  WSURL="${1/http/ws}"
  echo $WSURL
  IFS="/:";
  HOSTURL=( $1 )
  HOST=${HOSTURL[2]}
  echo $HOST
  IFS=" ";
  echo "<Location $2 >" | sudo -E tee -a $HTTPD_CONF
  echo "  # RequestHeader set Host \"${HOST}\"" | sudo -E tee -a $HTTPD_CONF
  # on localhost, preservehost leads to ssl proxy error
  if [ "$HOST" == "localhost" ]; then
      echo "  #ProxyPreserveHost On" | sudo -E tee -a $HTTPD_CONF
  else
      echo "  ProxyPreserveHost On" | sudo -E tee -a $HTTPD_CONF
  fi
  echo "  ProxyPass \"$1$2\"" | sudo -E tee -a $HTTPD_CONF
  echo "  ProxyPassReverse \"$1$2\"" | sudo -E tee -a $HTTPD_CONF
  echo "</Location>" | sudo -E tee -a $HTTPD_CONF
  echo "<Location $2/api/kernels/>"| sudo -E tee -a $HTTPD_CONF
  echo "  ProxyPass $WSURL$2/api/kernels/" | sudo -E tee -a $HTTPD_CONF
  echo "  ProxyPassReverse $WSURL$2/api/kernels/" | sudo -E tee -a $HTTPD_CONF
  echo "</Location>" | sudo -E tee -a $HTTPD_CONF
  # restart needed on SL7? issues reload on cernvm 4
  sudo service ${HTTPD_SERVICE} reload
}

function setjupyterurl {
 url=$1
  #sed -i -e "s/c\.NotebookApp\.base_url.*$/c\.NotebookApp\.base_url = '$1'" /home/vagrant/.jupyter/jupyter_notebook_config.py
 echo setting jupyter url to $url
 sed -i -e "s|\(c\.NotebookApp\.base\_url\s*=\s*\).*$|\1\'$url\'|g" /home/vagrant/.jupyter/jupyter_notebook_config.py
}

function removeapacheproxy {
 L1=`grep -n -m 1 "\<Location $1" $HTTPD_CONF | cut -f1 -d:`
 if [ $L1 > 0 ]; then
   echo removing apache proxy $1
   echo from row $L1
   let L2=$L1+9
   echo to row $L2
   sudo sed -i "$L1,$L2 d" $HTTPD_CONF
 fi
}

function killjupyter {
echo processes to kill on port $1:
echo ps -ef \| egrep "[p]ort $1"
ps -ef | egrep "[p]ort $1"
PIDS=`ps -ef | egrep "[p]ort $1" | awk '{ print $2 }'`
echo killing jupyter processes $PIDS
kill $PIDS
}

echo startJupyter.sh called with args: $1:$2:$3:$4:$5

if [ -z $2 ]; then
  echo missing username
  help
  exit 1
fi

if [ -z $3 ]; then
  echo missing port
  help
  exit 1
fi

if [ -z $4 ]; then
  echo missing proxyurlpart
  help
  exit 1
fi


if [ $1 == 'remove' ]; then
  killjupyter $3
  removeapacheproxy $4
  exit
fi

if [ $1 == 'add' ]; then
  WORKDIR=/srv/virtualfolder/$2
  if [ -d $WORKDIR ]; then
    echo working directory exists
  else
    echo trying to create working directory, it\'ll be empty
    mkdir -p $WORKDIR
  fi
  if [ -d $WORKDIR ]; then
    cd $WORKDIR
    addapacheproxy http://localhost:$3 $4
    setjupyterurl $4
    if [ -z $5 ]; then
      echo launching jupyter without logs
      source /opt/jupyter/bin/activate py3
      jupyter notebook --port $3 --no-browser &
    else
      echo launching jupyter log to $5
      source /opt/jupyter/bin/activate py3
      jupyter notebook --port $3 --no-browser >$5 2>&1 &
    fi
    exit
  else
    echo Directory $WORKDIR does not exist.
    help
    exit 1
  fi
fi

help
exit 1
