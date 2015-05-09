require "sinatra"
require "pry"
require './config/initializers/google_places.rb'
require "sinatra/cookies"
require "json"
require "google_places"


get '/' do
  erb :index
end

get '/heartbeat' do
  client = GooglePlaces::Client.new(GOOGLE_PLACES["api_key"])

  client.spots(36.0679, -86.7194).to_s
end

post '/go' do
  if params[:radius_in_miles].nil?
    radius = (5 * 1609.34)
  else
    radius = params[:radius_in_miles].to_i * 1609.34
  end

  client = GooglePlaces::Client.new(GOOGLE_PLACES["api_key"])

  spots = client.spots(params[:lat], params[:lng], types: ['restaurant'], radius: radius)

  if !spots.empty?
    spot = spots.sample

    {
      name: spot.name,
      location: spot.vicinity
    }.to_json
  else
    "No results found"
  end
end