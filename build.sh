#!/bin/bash

echo "" 
echo "Fixing Build..."

echo "build/index"
perl -pi -w -e 's/src="\/static\/js/src=".\/static\/js/g;' build/index.html;
perl -pi -w -e 's/href="\//href=".\//g;' build/index.html;

echo "" 
echo "COMPLETED!" 
echo "" 