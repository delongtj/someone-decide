$(document).on("ready", function(){
  $go = $("#go")
  spinner = Ladda.create($go[0])
  $results = $("#results")
  $placeName = $("#placeName")
  $placeLocation = $("#placeLocation")
  $slider = $("#slider")
  $range = $("#range")
  $units = $("#units")
  $keyword = $("#keyword")

  function getLocation() {
    navigator.geolocation.getCurrentPosition(getResults);
  }

  function getResults(position) {
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
        $placeName.html(response.name);

        link = "<a href='https://www.google.com/maps/place/" + response.location.replace(' ', '+') + "' target='_blank'>" + response.location + "</a>";

        $placeLocation.html(link)
      }
      else {
        $placeName.html("No results :(");
        $placeLocation.html("");
      }

    }).always(function(){
      spinner.stop()
    })
  }

  $go.on("click", function(event){
    event.preventDefault();

    spinner.start();

    getLocation()
  })

  $slider.on("input", function(event){
    $range.html($slider.val())

    if(parseInt($slider.val()) <= 1)
      $units.html("mile");
    else
      $units.html("miles");

  })

  $slider.trigger("input")
})