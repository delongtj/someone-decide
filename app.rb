require "sinatra"
require "pry"
require './config/initializers/yelp.rb'
require './config/initializers/google.rb'
require "sinatra/cookies"
require "json"
require "yelp"

enable :sessions

get '/' do
  unless request.secure? || request.env['REQUEST_URI'].match('localhost')
    redirect to(request.env['REQUEST_URI'].gsub('http://', 'https://'))
  end

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

  request_hash = params.to_json

  if session[:request_hash] == request_hash && session[:results]
    results = session[:results]
  else
    client = Yelp::Client.new({ consumer_key: YELP['consumer_key'],
                            consumer_secret: YELP['consumer_secret'],
                            token: YELP['token'],
                            token_secret: YELP['token_secret']
                          })

    opts = {
      category_filter: 'restaurants',
      radius_filter: radius.round
    }

    opts[:term] = params[:keyword] unless params[:keyword].nil?

    response = client.search_by_coordinates({ latitude: params[:lat], longitude: params[:lng] }, opts)

    results = []

    response.businesses.each do |business|
      results << { 
        id: business.id,
        name: business.name,
        categories: business.categories.map(&:first).join(', '),
        location: business.location.display_address.join(' ').gsub(',', ''),
        latitude: business.location.coordinate.latitude,
        longitude: business.location.coordinate.longitude
      }
    end

    session[:request_hash] = request_hash
    session[:results] = results
  end

  unless cookies[:blacklist].nil?
    blacklist = cookies[:blacklist].split("|")

    results.reject! { |b| blacklist.include?(b[:id]) }
  end

  unless results.empty?
    result = results.sample

    {
      place_id: result[:id],
      name: result[:name],
      categories: result[:categories],
      location: result[:location],
      latitude: result[:latitude],
      longitude: result[:longitude],
      open_until: "",

    }.to_json
  else
    {}.to_json
  end
end