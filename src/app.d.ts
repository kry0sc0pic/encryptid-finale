// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			userID: string | null,
			userExists: boolean,
			userTeam: string | null,
			banned: boolean,
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};