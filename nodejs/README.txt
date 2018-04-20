NodeJS Tunnel

This NodeJS app is hosted in Predix Cloud

Edit the Manifest.yml file & config.json

config.json
{
	"localPort": 7999, -- leave this at 7999
	"serviceHost": "tunnel-server.run.aws-usw02-pr.ice.predix.io", -- you can change the name of this to whatever you want
	"servicePort": 443, --leave this
	"clientId": "admin", --this is your UAA client ID
	"clientSecret": "", --this is your UAA client secret
	"cert": "2323r23r34hhhH(*HOUou4on34", --leave this
	"UAA": "https://b72cb67e-89aa-49c8-8860-fc1124cef5as.predix-uaa.run.aws-usw02-pr.ice.predix.io", --this is your UAA URL
	"proxy": "http://iss-americas-pitc-alpharettaz.proxy.corporate.ge.com:80", --add your proxy or leave blank
	"ssl-cert": "xxwewr34t34t34t" -- leave this
}

manifest.yml
applications:
  - name: tunnel-server --you can name this whatever you want
    buildpack: https://github.com/cloudfoundry/buildpack-nodejs.git - - leave this
    memory: 1G
    disk_quota: 256M
    command: DEBUG=ph:server node example/server
    stack: cflinuxfs2
    env:
        CLIENT: '{"tunnel": { "remoteHost": "db-9f25fd70-fd21-4e66-b0e7-816841443489.c7uxaqxgfov44.us-west-2.rds.amazonaws.com", "remotePort": 5432, "validate_uaa_url": "https://b72cb67e-89aa-49c8-8860-fc1124cef5as.predix-uaa.run.aws-usw02-pr.ice.predix.io/check_token", "clientid": "admin", "clientsecret": "" }}'

leave the memory, disk, quota, command, and stack at the defaults.
In remote host add your Predix postgres URL and port
Replace the UAA url (leave the /check_token at the end)
add your client ID & client secret

	
save the file and do a 'cf push' in predix.

