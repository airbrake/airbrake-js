execute "npm install" do
  command "su -c \"cd /vagrant; npm install --save-dev\" vagrant"
end

execute "bower install" do
  command "su -c \"cd /vagrant; ./node_modules/.bin/bower install\" vagrant"
end
