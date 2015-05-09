require 'dotenv'
Dotenv.load

require 'yaml'

GOOGLE_PLACES = YAML::load(ERB.new(File.read('./config/google_places.yml')).result)[settings.environment.to_s]