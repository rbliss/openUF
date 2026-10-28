#
# LuCI status page for openUF: Services -> openUF. Plain package rules rather
# than luci.mk, so the feed builds without the LuCI feed beside it.
#
# Adapted from luci-app-openuf in fonix232/openUF
# (https://github.com/fonix232/openUF), MIT license.
#

include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-openuf
PKG_VERSION:=0.13.0
PKG_RELEASE:=1

PKG_MAINTAINER:=rbliss <https://github.com/rbliss/openUF>
PKG_LICENSE:=MIT

include $(INCLUDE_DIR)/package.mk

define Package/luci-app-openuf
  SECTION:=luci
  CATEGORY:=LuCI
  SUBMENU:=3. Applications
  TITLE:=LuCI status page for openUF
  URL:=https://github.com/rbliss/openUF
  PKGARCH:=all
  DEPENDS:=+openuf +luci-base +rpcd-mod-ucode
endef

define Package/luci-app-openuf/description
  Services -> openUF: the daemon, its controller and adoption state, and the
  identity and hardware it reports.
endef

define Build/Prepare
endef

define Build/Configure
endef

define Build/Compile
endef

define Package/luci-app-openuf/install
	$(INSTALL_DIR) $(1)/www
	$(CP) ./htdocs/. $(1)/www/
	$(CP) ./root/. $(1)/
endef

define Package/luci-app-openuf/postinst
#!/bin/sh
[ -n "$${IPKG_INSTROOT}" ] && exit 0
rm -f /tmp/luci-indexcache.*
rm -rf /tmp/luci-modulecache/
killall -HUP rpcd 2>/dev/null
exit 0
endef

$(eval $(call BuildPackage,luci-app-openuf))
