export type AccountType = "user" | "company" | "moderator";

type BaseConfig = {
  accountType: AccountType;
  accountDefaultSites: { [key in AccountType]: string };
};

export const baseConfig = {
  accountType: "user",
  accountDefaultSites: {
    user: "/map",
    company: "/company",
    moderator: "/moderator"
  }
} satisfies BaseConfig;