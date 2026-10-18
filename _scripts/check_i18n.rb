# Structural parity check between the language files: same keys, list lengths and non-text values.
# Usage: ruby _scripts/check_i18n.rb [en.yml] [ko.yml]
require "yaml"

en_path, ko_path = ARGV[0] || "_data/resume/en.yml", ARGV[1] || "_data/resume/ko.yml"
en, ko = YAML.load_file(en_path), YAML.load_file(ko_path)
errs = []

walk = lambda do |a, b, path|
  if a.class != b.class
    errs << "#{path}: #{a.class} in en vs #{b.class} in ko"
  elsif a.is_a?(Hash)
    (a.keys | b.keys).each do |k|
      next walk.(a[k], b[k], "#{path}.#{k}") if a.key?(k) && b.key?(k)
      errs << "#{path}.#{k}: missing in #{a.key?(k) ? 'ko' : 'en'}"
    end
  elsif a.is_a?(Array)
    a.size == b.size ? a.each_with_index { |v, i| walk.(v, b[i], "#{path}[#{i}]") } : errs << "#{path}: #{a.size} items in en vs #{b.size} in ko"
  elsif !a.is_a?(String) && a != b
    errs << "#{path}: #{a.inspect} vs #{b.inspect}"
  end
end
walk.(en, ko, "")

# Identity values that must not be translated (only meaningful once the structure matches).
if errs.empty?
  %w[handle first_name last_name alias photo].each { |k| errs << "profile.#{k} must equal en" if en["profile"][k] != ko["profile"][k] }
  en["projects"].each_with_index { |p, i| errs << "projects[#{i}].stack must equal en" if p["stack"] != ko["projects"][i]["stack"] }
  en["experience"].each_with_index { |e, i| %w[logo link].each { |k| errs << "experience[#{i}].#{k} must equal en" if e[k] != ko["experience"][i][k] } }
  ko["ui"]["sections"].each { |k, v| errs << "ui.sections.#{k}: missing <em>…</em> accent" unless v.to_s.include?("<em>") }
end

# Values that must be plain strings (a stray ': ' turns a bullet into a Hash).
check_strings = lambda do |node, path|
  case node
  when Hash then node.each { |k, v| check_strings.(v, "#{path}.#{k}") }
  when Array then node.each_with_index { |v, i| v.is_a?(Hash) && !v.key?("title") && !v.key?("name") && !v.key?("company") && !v.key?("school") && !v.key?("group") && !v.key?("label") && !v.key?("kicker") ? errs << "#{path}[#{i}]: Hash where a string was expected (unquoted ': '?)" : check_strings.(v, "#{path}[#{i}]") }
  end
end
check_strings.(ko, "")

if errs.empty?
  puts "STRUCTURE OK (#{ko_path} matches #{en_path})"
else
  puts errs
  exit 1
end
