// Fetches recent messages from public Telegram channels
// Uses the public Telegram Bot API (no user login required)
// Requires TELEGRAM_BOT_TOKEN in environment variables
// Note: can only read channels where the bot is a member

import { TelegramMessage, MCPToolResult } from '../types'

export async function fetchTelegramChannel(
  channelUsername: string,
  limit = 10
): Promise<MCPToolResult<TelegramMessage[]>> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) {
    return {
      success: false,
      data: null,
      error: 'TELEGRAM_BOT_TOKEN not set in environment variables',
      fetchedAt: new Date().toISOString(),
      source: channelUsername
    }
  }
  try {
    const url = `https://api.telegram.org/bot${token}/getUpdates?limit=${limit}`
    const response = await fetch(url)
    const data: any = await response.json()
    if (!data.ok) {
      return {
        success: false,
        data: null,
        error: `Telegram API error: ${data.description}`,
        fetchedAt: new Date().toISOString(),
        source: channelUsername
      }
    }
    // Filter updates from the target channel
    const messages: TelegramMessage[] = data.result
      .filter((update: any) =>
        update.channel_post &&
        update.channel_post.chat.username === channelUsername
      )
      .map((update: any) => ({
        id: update.channel_post.message_id,
        text: update.channel_post.text || '',
        date: new Date(update.channel_post.date * 1000).toISOString(),
        channel: channelUsername,
        views: update.channel_post.views
      }))
    return {
      success: true,
      data: messages,
      fetchedAt: new Date().toISOString(),
      source: channelUsername
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      fetchedAt: new Date().toISOString(),
      source: channelUsername
    }
  }
}
