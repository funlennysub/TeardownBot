const InteractionConstants = {
  baseURL: 'https://discord.com/api/v8',
  commands: (applicationId, guildId) => `${InteractionConstants.baseURL}/applications/${applicationId}/guilds/${guildId}/commands`,
}

export default InteractionConstants
