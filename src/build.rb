root = File.expand_path(File.dirname(__FILE__))
output = File.join(root, "spritespin.js")
outmin = File.join(root, "spritespin.min.js")
input = [
  File.join(root, "dev", "spriteloader.js"),
  File.join(root, "dev", "spritespin.core.js"),
]
input += Dir.glob(File.join(root, "dev", "spritespin.beh-*.js")) 
input += Dir.glob(File.join(root, "dev", "spritespin.mod-*.js"))

File.delete(output) if File.exists?(output)
File.delete(outmin) if File.exists?(outmin)

File.open(output, 'w') do |f|
  input.each do |path|
    f.puts File.read(path)
    #f.puts "\n"
  end
end