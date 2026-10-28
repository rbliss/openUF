-- Print the settings luci.openuf shows from conf.lua, its modelmap and its
-- ufmodel, as JSON. Run from /opt/openuf: conf.lua loads its modelmap by a
-- path relative to the working directory, as the daemon does.
local cjson = require("cjson")

local modelmap
local load_file = dofile
dofile = function(path)
	if type(path) == "string" then
		modelmap = path:match("^modelmap/(.+)%.lua$") or modelmap
	end
	return load_file(path)
end
load_file("conf.lua")
dofile = load_file

local c = config or {}
local uap = (dev and dev.openuf and dev.openuf.uap) or {}
local dconf = (dev and dev.conf) or {}
local net = dconf.net or {}

local model = {}
if type(uap.ufmodel) == "string" and uap.ufmodel:match("^[%w_.-]+$") then
	local ok, m = pcall(dofile, "ufmodel/" .. uap.ufmodel .. ".lua")
	if ok and type(m) == "table" then model = m end
end

local ports = {}
for _, p in ipairs(net.ports or {}) do
	ports[#ports + 1] = {
		idx    = p.idx,
		ifname = p.ifname,
		uplink = p.uplink == true,
	}
end

print(cjson.encode({
	bootstrap_adopt_user = c.bootstrap_adopt_user,
	debug_dump_file      = c.debug_dump_file,
	fw                   = model.fw and model.fw.ver,
	hwassign             = uap.hwassign,
	inform_url           = c.inform_url,
	l2_announce          = c.l2_announce ~= false,
	lan_name             = net.lan_name,
	led                  = dconf.led,
	model                = model.model,
	modelmap             = modelmap,
	ports                = ports,
	state_file           = c.state_file,
	ufmodel              = uap.ufmodel,
}))
