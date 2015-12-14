#!/bin/bash
branch="originDokku"
echo "Pushing $branch to Server"
git push $branch master
if [ $? -eq 0 ] 
then
  echo "push successful"
else
  echo "push fail"
fi  
echo "####Updating the port"
ssh root@engage.smoothboard.org './update.sh'
if [ $? -eq 0 ] 
then
  echo "update successful"
else
  echo "update fail"
fi  
