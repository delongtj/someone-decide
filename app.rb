require "sinatra"
require "pry"
require './config/initializers/google.rb'
require "sinatra/cookies"
require "json"
require "google_places"

get '/' do
  unless request.secure? || request.env['SERVER_NAME'].match('localhost')
    redirect to(request.env['REQUEST_URI'].gsub('http://', 'https://'))
  end

  erb :index
end

get '/about' do
  erb :about
end

get '/heartbeat' do
  client = GooglePlaces::Client.new(GOOGLE["maps_api_key"])

  client.spots(36.0679, -86.7194).to_s
end

post '/go' do
  if params[:radius_in_miles].nil?
    radius = (5 * 1609.34)
  else
    radius = params[:radius_in_miles].to_f * 1609.34
  end

  client = GooglePlaces::Client.new(GOOGLE["maps_api_key"])

  opts = {
    types: ['restaurant'],
    radius: radius.round,
    opennow: true
  }

  opts[:keyword] = params[:keyword] unless params[:keyword].nil?

  spots = client.spots(params[:lat], params[:lng], opts)

  results = []

  spots.each do |spot|
    results << { 
      id: spot.place_id,
      name: spot.name,
      url: spot.url,
      location: spot.vicinity,
      latitude: spot.lat,
      longitude: spot.lng
    }
  end

  results.to_json
end
