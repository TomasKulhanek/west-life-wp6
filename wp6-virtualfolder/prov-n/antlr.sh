export CLASSPATH=antlr-4.7.1-complete.jar:$CLASSPATH
java -Xmx500M -cp "antlr-4.7.1-complete.jar:$CLASSPATH" org.antlr.v4.Tool $*