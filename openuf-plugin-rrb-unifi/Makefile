#
# rrb-unifi: 802.11r fast roaming between an openUF AP and genuine UniFi APs.
#
# The code is d-malinowski/unifi-openwrt-roaming (GPL-3.0-or-later). This
# recipe downloads its release at build time, so none of its files are in
# this MIT repository.
#

include $(TOPDIR)/rules.mk

PKG_NAME:=openuf-plugin-rrb-unifi
PKG_VERSION:=1.4
PKG_RELEASE:=1

PKG_SOURCE:=unifi-openwrt-roaming-$(PKG_VERSION).tar.gz
PKG_SOURCE_URL:=https://codeload.github.com/d-malinowski/unifi-openwrt-roaming/tar.gz/v$(PKG_VERSION)?
PKG_HASH:=ab987984b515700e7dfd7e5e2134a3945401b47237041efb7871abcfef9e797b
PKG_BUILD_DIR:=$(BUILD_DIR)/unifi-openwrt-roaming-$(PKG_VERSION)

PKG_LICENSE:=GPL-3.0-or-later
PKG_LICENSE_FILES:=LICENSE

include $(INCLUDE_DIR)/package.mk

# ucode-mod-ubus and ucode-mod-uloop carry only the UniFi roam announcements;
# without them the daemon still translates the key exchange.
define Package/openuf-plugin-rrb-unifi
  SECTION:=net
  CATEGORY:=Network
  TITLE:=openUF plugin for 802.11r fast roaming with UniFi APs (rrb-unifi)
  URL:=https://github.com/d-malinowski/unifi-openwrt-roaming
  PKGARCH:=all
  DEPENDS:=+openuf +ucode +ucode-mod-fs +ucode-mod-socket +ucode-mod-ubus \
	+ucode-mod-uloop +kmod-veth
endef

define Package/openuf-plugin-rrb-unifi/description
  Lets clients make 802.11r fast transitions between an openUF AP and
  genuine UniFi APs. The rrb-unifi daemon converts the RRB key exchange
  frames (ethertype 0x88b7) between the OpenWrt hostapd and UniFi framing
  on the veth pair vft0/vft1. The openUF plugin rrb-unifi writes the
  802.11r options a UniFi peer needs. The plugin is not enabled: add
  rrb-unifi to /etc/openuf/plugins.enabled. See USAGE.md in openUF.
endef

define Package/openuf-plugin-rrb-unifi/conffiles
/etc/config/rrb-unifi
endef

define Build/Compile
endef

define Package/openuf-plugin-rrb-unifi/install
	$(INSTALL_DIR) $(1)/usr/sbin $(1)/etc/init.d $(1)/etc/config \
		$(1)/etc/openuf/plugins $(1)/etc/uci-defaults
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/rrb-unifi.uc $(1)/usr/sbin/rrb-unifi.uc
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/rrb-unifi-setup $(1)/usr/sbin/rrb-unifi-setup
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/rrb-unifi.init $(1)/etc/init.d/rrb-unifi
	$(INSTALL_CONF) $(PKG_BUILD_DIR)/rrb-unifi.config $(1)/etc/config/rrb-unifi
	$(INSTALL_DATA) $(PKG_BUILD_DIR)/openuf-plugin/rrb-unifi.lua \
		$(1)/etc/openuf/plugins/rrb-unifi.lua
	$(INSTALL_DATA) ./files/rrb-unifi.uci-defaults $(1)/etc/uci-defaults/90_rrb-unifi
endef

# default_postinst runs the uci-defaults script before this, so on a first
# install the veth sections exist and a network reload creates the veth. An
# upgrade leaves the old daemon running under procd, and openUF keeps the old
# plugin loaded until it restarts.
define Package/openuf-plugin-rrb-unifi/postinst
#!/bin/sh
[ -n "$${IPKG_INSTROOT}" ] && exit 0
if [ "$${PKG_UPGRADE}" = 1 ]; then
	/etc/init.d/rrb-unifi restart
	if sed 's/#.*//; s/^[[:space:]]*//; s/[[:space:]]*$$//' /etc/openuf/plugins.enabled 2>/dev/null | grep -qxF rrb-unifi; then
		/etc/init.d/openuf restart
	fi
	exit 0
fi
peer=$$(uci -q get network.vft.peer_name)
if [ -n "$$peer" ] && [ ! -e "/sys/class/net/$$peer" ]; then
	/etc/init.d/network reload
fi
exit 0
endef

# openUF must push the WLANs without ft_iface=vft0 before the veth goes
# (docs/PLUGINS.md, uninstall order). Removal therefore only disables the
# plugin and restarts openUF, and leaves the veth sections in
# /etc/config/network for the user to delete after that push.
define Package/openuf-plugin-rrb-unifi/prerm
#!/bin/sh
[ -n "$${IPKG_INSTROOT}" ] && exit 0
[ "$${PKG_UPGRADE}" = 1 ] && exit 0
enabled=/etc/openuf/plugins.enabled
if sed 's/#.*//; s/^[[:space:]]*//; s/[[:space:]]*$$//' "$$enabled" 2>/dev/null | grep -qxF rrb-unifi; then
	sed -i '/^[[:space:]]*rrb-unifi[[:space:]]*\(#.*\)\{0,1\}$$/d' "$$enabled"
	/etc/init.d/openuf restart
fi
exit 0
endef

$(eval $(call BuildPackage,openuf-plugin-rrb-unifi))
