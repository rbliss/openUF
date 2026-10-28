#
# openUF as an OpenWrt package, built by a buildroot or SDK with this
# repository as a feed (USAGE.md, "Installation").
#
# Adapted from the openuf package in fonix232/openUF
# (https://github.com/fonix232/openUF), MIT license.
#

include $(TOPDIR)/rules.mk

PKG_NAME:=openuf
PKG_VERSION:=0.13.0
PKG_RELEASE:=1

PKG_MAINTAINER:=rbliss <https://github.com/rbliss/openUF>
PKG_LICENSE:=MIT
PKG_LICENSE_FILES:=LICENSE

# A host Lua runs tools/strip.lua, as in the release tarball.
PKG_BUILD_DEPENDS:=lua/host

OPENUF_ROOT:=$(abspath $(CURDIR)/../..)
PKG_FILE_DEPENDS:=$(OPENUF_ROOT)/openuf $(OPENUF_ROOT)/tools/dist.sh $(OPENUF_ROOT)/tools/strip.lua

include $(INCLUDE_DIR)/package.mk

define Package/openuf
  SECTION:=net
  CATEGORY:=Network
  TITLE:=UniFi access point emulation for a UniFi Network Application
  URL:=https://github.com/rbliss/openUF
  PKGARCH:=all
  DEPENDS:=+lua +lua-cjson +luasocket +lua-openssl +luabitop +libuci-lua +iw
endef

define Package/openuf/description
  Makes an OpenWrt access point adoptable by a UniFi Network Application.
  The service does not start on a wpad-basic build: install a full wpad or
  hostapd build. USAGE.md section 1 lists the optional packages that each
  enable one feature.
endef

define Build/Prepare
	$(INSTALL_DIR) $(PKG_BUILD_DIR)
endef

define Build/Configure
endef

define Build/Compile
	cd $(OPENUF_ROOT) && LUA=$(STAGING_DIR_HOSTPKG)/bin/lua \
		sh tools/dist.sh --stage $(PKG_BUILD_DIR)/openuf
endef

# The package ships conf.lua as conf.lua.dist. postinst copies it to conf.lua
# only when that file is missing, so an upgrade or a reinstall never replaces
# the device's modelmap selection.
define Package/openuf/install
	$(INSTALL_DIR) $(1)/opt/openuf
	$(CP) $(PKG_BUILD_DIR)/openuf/. $(1)/opt/openuf/
	rm -rf $(1)/opt/openuf/etc
	mv $(1)/opt/openuf/conf.lua $(1)/opt/openuf/conf.lua.dist
	$(INSTALL_DATA) $(OPENUF_ROOT)/LICENSE $(1)/opt/openuf/LICENSE
	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/openuf/etc/init.d/openuf $(1)/etc/init.d/openuf
	$(INSTALL_DIR) $(1)/usr/bin
	$(LN) /opt/openuf/hook/syswrapper.sh $(1)/usr/bin/syswrapper.sh
	$(INSTALL_DIR) $(1)/lib/upgrade/keep.d
	$(INSTALL_DATA) ./files/openuf.keep $(1)/lib/upgrade/keep.d/openuf
endef

# An install.sh install has /opt/openuf but no keep.d file from this package.
# Its tree goes, except conf.lua, so no file from an older release stays
# behind beside the package's files.
define Package/openuf/preinst
#!/bin/sh
[ -n "$${IPKG_INSTROOT}" ] && exit 0
[ -f /lib/upgrade/keep.d/openuf ] && exit 0
[ -f /opt/openuf/inform.lua ] || exit 0
/etc/init.d/openuf stop >/dev/null 2>&1
mv /opt/openuf /opt/openuf.install-sh
mkdir -p /opt/openuf
[ -f /opt/openuf.install-sh/conf.lua ] && mv /opt/openuf.install-sh/conf.lua /opt/openuf/conf.lua
rm -rf /opt/openuf.install-sh
exit 0
endef

# procd does not restart a running service whose instances are unchanged, so
# without the restart an upgrade keeps running the old Lua.
define Package/openuf/postinst
#!/bin/sh
[ -e "$${IPKG_INSTROOT}/opt/openuf/conf.lua" ] \
	|| cp "$${IPKG_INSTROOT}/opt/openuf/conf.lua.dist" "$${IPKG_INSTROOT}/opt/openuf/conf.lua"
[ -n "$${IPKG_INSTROOT}" ] && exit 0
/etc/init.d/openuf restart
exit 0
endef

# Removal leaves /etc/openuf/ and /opt/openuf/conf.lua, which the package does
# not own. Only the ubnt account that install.sh --bootstrap-adopt creates is
# removed: its GECOS field names openUF.
define Package/openuf/prerm
#!/bin/sh
[ -n "$${IPKG_INSTROOT}" ] && exit 0
[ "$${PKG_UPGRADE}" = 1 ] && exit 0
if grep -q '^# openuf-cron-begin' /etc/crontabs/root 2>/dev/null; then
	sed -i '/^# openuf-cron-begin/,/^# openuf-cron-end$$/d' /etc/crontabs/root
	/etc/init.d/cron restart >/dev/null 2>&1
fi
if grep -q '^ubnt:[^:]*:[0-9]*:[0-9]*:openuf bootstrap adoption:' /etc/passwd 2>/dev/null; then
	sed -i '/^ubnt:/d' /etc/passwd /etc/shadow
	sed -i '/^openuf:/d' /etc/group
fi
exit 0
endef

$(eval $(call BuildPackage,openuf))
