# tinypagemanager
Knockout an JQuery based pageManager for single page web applications  and PWA

Readme is under construction.

See project for details.


## Installation
#### Add knockout, Jquery and tinypagemanager to your html head section.
     <script src="js/knockout-latest.js"></script>
     <script src="js/jquery.min.js"></script>
     <script src="js/jquery-ui.min.js"></script>
     <script src="tinypagemanager.js"></script>
 
#### Add placeholder to your html page
     <div id="view"></div>  
      
#### Initialize tinypagemanager inside your javascript
     var pageManager = new tinyPageManager($("#view"));
          
#### Create Views
Add Views (pages). See folder "views" for example.

#### Load your first page
     pageManager.loadPage("start");
 
