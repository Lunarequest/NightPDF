const path = require("path");
const builder = require("electron-builder");
const { flipFuses, FuseVersion, FuseV1Options } = require("@electron/fuses");

/** @type electron-builder.Configuration */
const config = {
	appId: "io.github.lunarequest.NightPDF",
	productName: "NightPDF",
	files: [
		"**/*",
		"!*.{ts}",
		"!app${/*}",
		"!build${/*}",
		"!docs${/*}",
		"!*.{md,json}",
		"!.husky",
		"!.vscode",
		"!.github",
		"!build.mts",
		"!update_pdfjs.py",
		"!.rtx.toml",
		"!.yarnclean",
		"!electron-builder-config.js",
		"!.python-version",
		"!*.pdf",
	],
	fileAssociations: [
		// pdf
		{
			ext: "pdf",
			name: "PDF File",
			icon: "build/icon.icns",
			role: "viewer",
			isPackage: false,
		},
		// xfa
		{
			ext: "xdp",
			name: "XFA File",
			icon: "build/icon.icns",
			role: "viewer",
			isPackage: false,
		},
		// fdf
		{
			ext: "fdf",
			name: "FDF File",
			icon: "build/icon.icns",
			role: "viewer",
			isPackage: false,
		},
		// xfdf
		{
			ext: "xfdf",
			name: "XFDF File",
			icon: "build/icon.icns",
			role: "viewer",
			isPackage: false,
		},
	],
	linux: {
		desktop: {
			Name: "NightPDF",
			Comment: "Dark Mode PDF reader",
		},
		synopsis: "Dark Mode PDF reader",
		publish: ["github"],
		target: [
			{ target: "AppImage", arch: ["x64", "arm64"] },
			{ target: "deb", arch: ["x64", "arm64"] },
			{ target: "rpm", arch: ["x64", "arm64"] },
		],
		mimeTypes: [
			"application/pdf",
			"application/x-pdf", // deprecated mime type
			"application/vnd.adobe.xdp+xml",
			"application/vnd.adobe.xfdf",
			"application/vnd.fdf",
		],
		category: "Utilty",
	},
	appImage: {
		artifactName: "${productName}-${version}-${arch}.${ext}",
	},
	win: {
		publish: ["github"],
		target: ["nsis", "portable"],
		icon: "build/icon.ico",
	},
	nsis: {
		oneClick: false,
		allowElevation: true,
		deleteAppDataOnUninstall: true,
		uninstallDisplayName: "Night PDF",
		artifactName: "${productName}-${version}-${arch}-nsis.${ext}",
	},
	portable: {
		artifactName: "${productName}-${version}-${arch}-portable.${ext}",
	},
	mac: {
		publish: ["github"],
		category: "public.app-category.productivity",
		target: [
			{
				target: "dmg",
				arch: ["universal"],
			},
		],
		bundleVersion: "1",
		artifactName: "${productName}-${version}.${ext}",
		darkModeSupport: true,
		hardenedRuntime: true,
		gatekeeperAssess: false,
		type: "distribution",
	},
	dmg: {
		sign: false,
	},
	/** @param {builder.AfterPackContext} context */
	afterPack: async (context) => {
		await addElectronFuses(context);
	},
};
if (process.env.OUTPUTDIR === "1") {
	if (config.linux) {
		//@ts-ignore
		config.linux.target = ["dir"];
	}
}
/** @param {builder.AfterPackContext} context  */
async function addElectronFuses(context) {
	const {
		appOutDir,
		packager: { appInfo },
		electronPlatformName,
		arch,
	} = context;
	const ext = {
		darwin: ".app",
		win32: ".exe",
		linux: [""],
	}[electronPlatformName];

	const electronBinaryPath = path.join(
		appOutDir,
		`${appInfo.productFilename.toLowerCase()}${ext}`,
	);
	console.log("Flipping fuses for: ", electronBinaryPath);

	await flipFuses(electronBinaryPath, {
		version: FuseVersion.V1,
		resetAdHocDarwinSignature:
			electronPlatformName === "darwin" &&
			arch === builder.Arch.universal,
		[FuseV1Options.RunAsNode]: false,
		[FuseV1Options.EnableCookieEncryption]: true,
		[FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
		[FuseV1Options.EnableNodeCliInspectArguments]: false,
		[FuseV1Options.OnlyLoadAppFromAsar]: true,
	});
}

module.exports = config;
