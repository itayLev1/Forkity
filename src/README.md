# Forkify Project

Recipe application: 
  Upload a custom recipe
  Search for recipes online
  Bookmark recipes
  Control and customize amounts  
  
For Developers:
  MVC architecture pattern
  Api calls
  Data base managing
  State managing
  DOM 
  Bundled with Parcel

To run this application in a docker container:
  Run this command in BASH CLI to create the container image:
    `docker build -t forkify-app .`
  Run this command in BASH CLI to run the container and serve in port 8080:
    `docker run -d -p 8080:80 --name forkify-container forkify-app`
