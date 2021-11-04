import path from 'path'
import { readFileSync } from 'fs'
import { PrismaClient } from '@prisma/client'
import { history2strings, string2parts } from '../lib/parser'

const CHAT_HISTORY_PATH = path.join(__dirname, '../data/chat_history.json')
const USER_ID = 'user2945779'

const prisma = new PrismaClient()

async function getWord(word: string) {
    return await prisma.word.findUnique({
        where: {
            value: word,
        }
    }) || await prisma.word.create({
        data: {
            value: word,
        }
    })
}

async function linkWords(from, to) {
    const link = await prisma.link.findFirst({
        where: {
            from,
            to,
        },
    })

    if (link) {
        await prisma.link.update({
            where: {
                id: link.id,
            },
            data: {
                count: link.count + 1,
            },
        })
    } else {
        await prisma.link.create({
            data: {
                from: typeof from === 'undefined' ? undefined : {
                    connect: {
                        id: from.id,
                    },
                },
                to: typeof to === 'undefined' ? undefined : {
                    connect: {
                        id: to.id,
                    },
                },
                count: 1,
            },
        })
    }
}

async function main () {
    const chatHistory = JSON.parse(readFileSync(CHAT_HISTORY_PATH, { encoding: 'utf8' }))
    const messages = history2strings(chatHistory, USER_ID)
    
    for (const index in messages) {
        const message = messages[index]
        console.log(`[${parseInt(index) + 1}/${messages.length}] ${message}`)

        const words = string2parts(message)

        for (let i = -1; i < words.length; i++) {
            const word = i >= 0 ? await getWord(words[i]) : undefined
            const nextWord = i < words.length - 1 ? await getWord(words[i + 1]) : undefined

            await linkWords(word, nextWord)
        }
    }
}

main().finally(async () => await prisma.$disconnect())
