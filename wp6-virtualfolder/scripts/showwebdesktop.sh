#!/bin/sh

terminal_wm_class="pythonwebdesktop.py"
terminal_exec="python /home/vagrant/src/pythonwebdesktop/pythonwebdesktop.py http://localhost/"

# no terminal started, so start one
if [ -z "`wmctrl -lx | grep pythonwebdesktop.py`" ]; then
    $terminal_exec &
else
    wmctrl -x -a $terminal_wm_class
fi;
