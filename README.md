# tinypagemanager
Knockout an JQuery based pageManager for single page web applications  and PWA

Readme is under construction.

See index.js for details.


## Installation
#### Add knockout and Jquery to your page. 
     <script src="js/knockout-latest.js"></script>
     <script src="js/jquery.min.js"></script>
     <script src="js/jquery-ui.min.js"></script>
 
#### Add placeholder to your html page.
     <div id="view"></div>
 
#### Add tinypagemanager.js to your page.
      <script src="tinypagemanager.js"></script>
      
### Initialize tinypagemanager inside your javascript
     var pageManager = new tinyPageManager($("#view"));
     
     
### Create Views
Add Views (pages). See folder "views" for example.

### Load your first page:
     pageManager.loadPage("start");
 
