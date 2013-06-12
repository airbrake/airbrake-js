execute "npm install" do
  command "su -c \"cd /vagrant; npm install --save-dev; ./node_modules/.bin/bower install\" vagrant"
end
