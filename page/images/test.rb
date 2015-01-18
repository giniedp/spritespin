
class App

  def entries(*arg)
    Dir.entries(File.join(arg)).reject { |entry| entry.start_with?('.') }
  end

  def find_folder(name)
    path = File.join(File.expand_path('..', __FILE__), name)
    return nil unless Dir.exists?(path)
    path
  end

  def run
    src_dir = find_folder('3d')
    dst_dir = find_folder('3d2')

    entries(src_dir).each do |file|
      src_file = File.join(src_dir, file)
      dst_file = File.join(dst_dir, file)

      `jpegtran -optimize -progressive -copy none -outfile #{dst_file} #{src_file}`
    end
  end

end

App.new.run
