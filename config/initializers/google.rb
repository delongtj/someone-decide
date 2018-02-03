require 'dotenv'

Dotenv.load

require 'yaml'

GOOGLE = YAML::load(ERB.new(File.read('./config/google.yml')).result)[settings.environment.to_s]
