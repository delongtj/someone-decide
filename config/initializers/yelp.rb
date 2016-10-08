require 'dotenv'
Dotenv.load

require 'yaml'

YELP = YAML::load(ERB.new(File.read('./config/yelp.yml')).result)[settings.environment.to_s]