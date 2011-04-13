require "tempfile"

def stitch_together images_arrayed, output
  per_row = Math.sqrt(images_arrayed.length).round
  rows = []
  while(images_arrayed.length > 0) do
    row = images_arrayed.shift(per_row).join(" ")
    rows << Tempfile.new("row_file.png").path
    Kernel.system("convert #{row} +append #{rows.last}")
  end
  rows = rows.join(" ")
  Kernel.system("convert #{rows} -append #{output}")
  
  return per_row
end

images = [
"rad_zoom_001.jpg",
#{}"rad_zoom_002.jpg",
"rad_zoom_003.jpg",
#{}"rad_zoom_004.jpg",
"rad_zoom_005.jpg",
#{}"rad_zoom_006.jpg",
"rad_zoom_007.jpg",
#{}"rad_zoom_008.jpg",
"rad_zoom_009.jpg",
#{}"rad_zoom_010.jpg",
"rad_zoom_011.jpg",
#{}"rad_zoom_012.jpg",
"rad_zoom_013.jpg",
#{}"rad_zoom_014.jpg",
"rad_zoom_015.jpg",
#{}"rad_zoom_016.jpg",
"rad_zoom_017.jpg",
#{}"rad_zoom_018.jpg",
"rad_zoom_019.jpg",
#{}"rad_zoom_020.jpg",
"rad_zoom_021.jpg",
#{}"rad_zoom_022.jpg",
"rad_zoom_023.jpg",
#{}"rad_zoom_024.jpg",
"rad_zoom_025.jpg",
#{}"rad_zoom_026.jpg",
"rad_zoom_027.jpg",
#{}"rad_zoom_028.jpg",
"rad_zoom_029.jpg",
#{}"rad_zoom_030.jpg",
"rad_zoom_031.jpg",
#{}"rad_zoom_032.jpg",
"rad_zoom_033.jpg",
#{}"rad_zoom_034.jpg"
].map{ |i| "./sprites/" + i}
output = "./packed.png"

stitch_together(images, output)