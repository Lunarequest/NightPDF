let config = {
	appId: "io.github.lunarequest.NightPDF",
	productName: "NightPDF",
	files: ["**/*", "!app${/*}", "!build${/*}", "!docs${/*}", "!*.{md,json}"],
	fileAssociations: [
		{
			ext: "pdf",
			icon: "build/icon.icns",
			role: "viewer",
			isPackage: false,
		},
	],
	linux: {
		desktop: {
			Name: "NightPdf",
			Comment: "Dark Mode PDF reader",
		},
		publish: ["github"],
		target: ["AppImage", "deb", "rpm"],
		category: "Utilty",
	},
	win: {
		publish: ["github"],
		target: ["nsis"],
		icon: "build/icon.ico",
		artifactName: "${productName}-${version}-${arch}.${ext}",
	},
	mac: {
		publish: ["github"],
		category: "public.app-category.productivity",
		target: ["dmg"],
		bundleVersion: "1",
		artifactName: "${productName}-${version}.${ext}",
		darkModeSupport: true,
		hardenedRuntime: true,
		gatekeeperAssess: false,
		type: "distribution",
	},
};

if (process.env.OUTPUTDIR === "1") {
	config.linux.target = ["dir"];
}

module.exports = config;
