interface ChatHistory {
    messages: {
        from_id: string,
        text?: string,
    }[],
}

export function history2strings (history: ChatHistory, user): string[] {
    return history.messages.filter(({ from_id, text}) => from_id === user && typeof text === 'string' && text.length > 0).map(({ text }) => text)
}

export function string2parts (str: string): string[] {
    return str.split(/\s+/)
}
