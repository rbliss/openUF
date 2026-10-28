'use strict';
'require view';
'require rpc';

// openUF status (luci-app-openuf): read-only, from the luci.openuf rpcd
// backend (root/usr/share/rpcd/ucode/luci.openuf).

const callStatus = rpc.declare({
	object: 'luci.openuf',
	method: 'status',
	expect: { '': {} }
});

function badge(ok, yes, no) {
	return E('span', {
		'class': 'label',
		'style': 'background:%s;color:#fff;padding:1px 6px;border-radius:3px'.format(ok ? '#4caf50' : '#e0a030')
	}, ok ? yes : no);
}

// Values from state files and conf.lua are inserted as text, never as markup
// (LuCI's E() treats a string child as HTML).
function T(s) {
	return document.createTextNode(String(s));
}

function yesno(v) {
	return v ? _('yes') : _('no');
}

function value(v, fallback) {
	return (v === null || v === undefined || v === '') ? E('em', {}, fallback || _('not set')) : T(v);
}

function section(title, rows) {
	return E('div', { 'class': 'cbi-section' }, [
		E('h3', {}, title),
		E('table', { 'class': 'table' }, rows.filter(function(r) { return r; }).map(function(r) {
			return E('tr', { 'class': 'tr' }, [
				E('td', { 'class': 'td left', 'style': 'width:33%' }, r[0]),
				E('td', { 'class': 'td left' }, r[1])
			]);
		}))
	]);
}

return view.extend({
	load: function() {
		return L.resolveDefault(callStatus(), {});
	},

	render: function(s) {
		const svc = s.service || {}, ctl = s.controller || {}, id = s.identity || {};
		const hw = s.hardware || {}, diag = s.diagnostics || {}, conf = s.config || {};

		if (!svc.installed)
			return E('div', { 'class': 'cbi-map' }, [
				E('h2', {}, _('openUF')),
				E('p', {}, _('Not installed'))
			]);

		const ports = (hw.ports || []).map(function(p) {
			return _('Port %d: %s').format(p.idx, p.ifname) + (p.uplink ? ' ' + _('(uplink)') : '');
		});

		return E('div', { 'class': 'cbi-map' }, [
			E('h2', {}, _('openUF')),

			section(_('Service'), [
				[ _('Daemon'), badge(svc.running, _('running'), _('stopped')) ],
				[ _('Start at boot'), yesno(svc.enabled) ],
				[ _('L2 discovery broadcasts'), conf.l2_announce
					? (svc.announcing ? _('on') : _('on, but the announce process is not running'))
					: _('off') ],
				[ _('SSH bootstrap account'), value(conf.bootstrap_adopt_user, _('none')) ]
			]),

			section(_('Controller'), [
				[ _('Inform URL'), value(ctl.inform_url) ],
				[ _('Adopted'), badge(ctl.adopted, _('adopted'), _('pending adoption')) ],
				[ _('Configuration version'), value(ctl.cfgversion, _('none received yet')) ],
				[ _('Wake-up (STUN)'), value(ctl.stun_url) ],
				ctl.upgrade_requested ? [ _('Upgrade requested'), T(ctl.upgrade_requested) ] : null
			]),

			section(_('Identity'), [
				[ _('Presented as'), id.model ? T('%s (ufmodel/%s.lua)'.format(id.model, id.ufmodel)) : value(id.ufmodel) ],
				[ _('Reported firmware'), value(id.fw) ],
				[ _('Identity MAC'), value(id.mac) ],
				[ _('Management address'), id.ip ? T(id.addressing ? '%s (%s)'.format(id.ip, id.addressing === 'dhcp' ? _('DHCP') : _('static')) : id.ip) : value(null) ],
				[ _('Hostname'), value(id.hostname) ]
			]),

			section(_('Hardware'), [
				[ _('Model map'), hw.modelmap ? T('modelmap/%s.lua'.format(hw.modelmap)) : value(null) ],
				[ _('Uplink port'), value(hw.uplink) ],
				[ _('Ports'), ports.length ? E('span', {}, ports.map(function(p) { return E('div', {}, T(p)); })) : E('em', {}, _('none')) ],
				[ _('Radios'), (hw.radios || []).length ? T(hw.radios.join(', ')) : E('em', {}, _('none')) ],
				[ _('Locate LED'), value(hw.led) ]
			]),

			section(_('Diagnostics'), [
				[ _('Blocked clients'), T(diag.blocked_clients || 0) ],
				conf.debug_dump_file ? [ _('Debug capture'), T(conf.debug_dump_file) ] : null
			])
		]);
	},

	handleSaveApply: null,
	handleSave: null,
	handleReset: null
});
