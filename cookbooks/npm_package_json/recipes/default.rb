execute "npm install" do
  command "su -c \"cd /vagrant; npm install --save-dev\" vagrant"
end
