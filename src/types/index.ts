export interface SettingsProp {
	url: string;
	adminToken: string;
}

export const DEFAULT_SETTINGS: SettingsProp = {
	url: "",
	adminToken: "",
};

export interface ContentProp {
	title: string;
	tags?: string[];
	featured?: boolean;
	status: string;
	excerpt?: string | undefined;
	feature_image?: string;
    meta_title?: string | undefined;
    meta_description?: string | undefined;
    custom_template?: string | undefined;
    email_only?: boolean;
}

export interface DataProp {
	content: string;
}
