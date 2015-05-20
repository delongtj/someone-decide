$(document).on("ready", function(){
  $go = $("#go")
  spinner = Ladda.create($go[0])
  $status = $("#status")
  $results = $("#results")
  $placeName = $("#placeName")
  $placeLocation = $("#placeLocation")
  $slider = $("#slider")
  $range = $("#range")
  $units = $("#units")

  function getLocation() {
    navigator.geolocation.getCurrentPosition(getResults);
  }

  function getResults(position) {
    $.ajax({
      method: "POST",
      dataType: "JSON",
      url: "/go",
      data: { lat: position.coords.latitude, lng: position.coords.longitude, radius_in_miles: $slider.val() }
    }).done(function(response){
      $placeName.html(response.name)
      $placeLocation.html(response.location)
    }).always(function(){
      spinner.stop()
      $status.html("")
    })
  }

  $go.on("click", function(event){
    event.preventDefault();

    spinner.start();

    //$status.html("Processing...")
    getLocation()
  })

  $slider.on("change", function(event){
    $range.html($slider.val())

    if(parseInt($slider.val()) <= 1)
      $units.html("mile");
    else
      $units.html("miles");

  })

  $slider.change()
})