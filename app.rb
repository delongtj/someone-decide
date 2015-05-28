require "sinatra"
require "pry"
require './config/initializers/google_places.rb'
require "sinatra/cookies"
require "json"
require "google_places"


get '/' do
  erb :index
end

get '/about' do
  erb :about
end

get '/heartbeat' do
  client = GooglePlaces::Client.new(GOOGLE_PLACES["api_key"])

  client.spots(36.0679, -86.7194).to_s
end

post '/go' do
  if params[:radius_in_miles].nil?
    radius = (5 * 1609.34)
  else
    radius = params[:radius_in_miles].to_f * 1609.34
  end

  client = GooglePlaces::Client.new(GOOGLE_PLACES["api_key"])

  opts = {
    types: ['restaurant'],
    radius: radius.round,
    opennow: true
  }

  opts[:keyword] = params[:keyword] unless params[:keyword].nil?

  spots = client.spots(params[:lat], params[:lng], opts)

  if !spots.empty?
    spot = spots.sample

    {
      place_id: spot.place_id,
      name: spot.name,
      location: spot.vicinity,
      open_until: "",

    }.to_json
  else
    {}.to_json
  end
end