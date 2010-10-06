desc "Builds spritespin JavaScript"
task :build do
  sh "java -jar bin/compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS --js src/jquery.spritespin.js --js_output_file src/jquery.spritespin.min.js"
  sh "cp src/jquery.spritespin.js examples/javascripts/jquery.spritespin.js"
  sh "cp src/jquery.spritespin.min.js examples/javascripts/jquery.spritespin.min.js"
end

task :default do
  puts "type 'rake build' to minify the spritespin source"
end