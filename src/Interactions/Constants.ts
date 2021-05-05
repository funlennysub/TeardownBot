const InteractionConstants = {
  baseURL: 'https://discord.com/api/v8',
  commands: (applicationId, guildId) => `/applications/${applicationId}/guilds/${guildId}/commands`
}

export default InteractionConstants
