# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  config.vm.box = "lucid64"
  # config.vm.box_url = "http://domain.com/path/to/above.box"

  config.vm.network :forwarded_port, :guest => 5858, :host => 5858

  config.vm.provision :chef_solo do |chef|
    chef.cookbooks_path = "cookbooks"
    chef.add_recipe "nodejs"
    chef.add_recipe "npm_package_json"

    chef.json = { :nodejs => { "install_method" => "binary" } }
  end
end
