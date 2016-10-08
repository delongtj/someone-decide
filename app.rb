require "sinatra"
require "pry"
require './config/initializers/yelp.rb'
require "sinatra/cookies"
require "json"
require "yelp"


get '/' do
  erb :index
end

get '/about' do
  erb :about
end

get '/heartbeat' do
  client = Yelp::Client.new({ consumer_key: YELP['consumer_key'],
                            consumer_secret: YELP['consumer_secret'],
                            token: YELP['token'],
                            token_secret: YELP['token_secret']
                          })

  client.search('Nashville').businesses.map(&:name)
end

post '/go' do
  if params[:radius_in_miles].nil?
    radius = (5 * 1609.34)
  else
    radius = params[:radius_in_miles].to_f * 1609.34
  end

  client = Yelp::Client.new({ consumer_key: YELP['consumer_key'],
                            consumer_secret: YELP['consumer_secret'],
                            token: YELP['token'],
                            token_secret: YELP['token_secret']
                          })

  opts = {
    category_filter: 'food',
    radius_filter: radius.round
  }

  opts[:term] = params[:keyword] unless params[:keyword].nil?

  coordinates = { latitude: params[:lat], longitude: params[:lng] }

  results = client.search_by_coordinates(coordinates, opts)

  # unless cookies[:blacklist].nil?
  #   blacklist = cookies[:blacklist].split("|")

  #   results.reject! { |s| blacklist.include?(s.place_id) }
  # end

  unless results.businesses.empty?
    result = results.businesses.sample

    {
      place_id: result.id,
      name: result.name,
      location: result.location.display_address.join(' ').gsub(',', ''),
      open_until: "",

    }.to_json
  else
    {}.to_json
  end
end