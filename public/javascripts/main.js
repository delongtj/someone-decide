(function(){
  $(document).on("ready", function(){
    $go = $("#go");
    $blacklist = $("#blacklist");

    spinner = Ladda.create($go[0]);

    $toggleAdvanced = $("#toggle-advanced");
    $advanced = $("#advanced");
    $results = $("#results");
    $placeName = $("#placeName");
    $placeLocation = $("#placeLocation");
    $slider = $("#slider");
    $range = $("#range");
    $units = $("#units");
    $keyword = $("#keyword");

    geoPosition = null;
    geoPositionTimestamp = null;

    function getLocation() {
      if(geocodeNeeded()) {
        navigator.geolocation.getCurrentPosition(getResults);
      }
      else {
        getResults(geoPosition)
      }
    }

    function geocodeNeeded() {
      if(geoPosition == null || geoPositionTimestamp == null) {
        return true;
      }
        
      // Redo geocode every two minutes
      if(new Date().getTime() - geoPositionTimestamp > 120000) {
        return true;
      }

      return false;
    }

    function getResults(position) {
      geoPosition = position;
      geoPositionTimestamp = new Date().getTime();

      $.ajax({
        method: "POST",
        dataType: "JSON",
        url: "/go",
        data: { 
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          radius_in_miles: $slider.val(),
          keyword: $keyword.val()
        }
      }).done(function(response){
        if(typeof(response.name) != "undefined"){
          $results.attr("data-place-id", response.place_id);
          $placeName.html(response.name);

          link = "<a href='https://www.google.com/maps/place/" + response.location.replace(' ', '+') + "' target='_blank'>" + response.location + "</a>";

          $placeLocation.html(link);
          $blacklist.show();
        }
        else {
          $placeName.html("No results :(");
          $placeLocation.html("");
          $blacklist.hide();
        }

      }).always(function(){
        spinner.stop();
        $results.show();
      })
    }

    $go.on("click", function(event){
      ga('send', 'event', 'button', 'click', 'action', 'go');

      event.preventDefault();

      $results.hide();

      spinner.start();

      getLocation();
    });

    $blacklist.on("click", function(event){
      ga('send', 'event', 'button', 'click', 'action', 'blacklist');

      event.preventDefault();

      place_id = $results.attr("data-place-id");

      cookie = Cookies.get('blacklist') || "";

      if (cookie == "")
        cookie = place_id
      else
        cookie = cookie + '|' + place_id

      Cookies.set('blacklist', cookie);

      $results.hide();
    });

    $slider.on("input", function(event){
      $range.html($slider.val());

      if(parseInt($slider.val()) <= 1)
        $units.html("mile");
      else
        $units.html("miles");
    });

    $toggleAdvanced.on("click", function(event) {
      event.preventDefault();
      
      if($toggleAdvanced.html() == "Advanced")
        $toggleAdvanced.html("Simple");
      else
        $toggleAdvanced.html("Advanced");

      $advanced.slideToggle();
    });

    $("#placeLocation a").on("click", function(event) {
      ga('send', 'event', 'link', 'click', 'maps');
    });

    $slider.trigger("input");
  });
})();