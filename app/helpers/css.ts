function toggleDarkConfigurator(darkConfiguratorElement: HTMLElement) {
	if (darkConfiguratorElement.style.visibility === "visible") {
		darkConfiguratorElement.style.visibility = "hidden";
	} else {
		darkConfiguratorElement.style.visibility = "visible";
	}
}

function hideDarkConfigurator(darkConfiguratorElement: HTMLElement) {
	if (darkConfiguratorElement.style.visibility === "visible") {
		darkConfiguratorElement.style.visibility = "hidden";
	}
}

export { hideDarkConfigurator, toggleDarkConfigurator };
