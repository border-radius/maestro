import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function getRandomLink(fromId) {
    const links = await prisma.link.findMany({
        where: {
            fromId
        },
    })

    const sum = links.reduce((sum, { count }) => sum + count, 0)
    
    let leftOver = Math.random() * sum
    let index = 0

    while (leftOver > links[index].count) {
        leftOver -= links[index].count
        index++
    }

    return links[index]
}

async function main() {
    let link
    const links = []

    do {
        link = await getRandomLink(link ? link.toId : null)
        links.push(link)
    } while (link.toId)

    const words = []

    for (const link of links) {
        if (link.toId) {
            const word = await prisma.word.findUnique({
                where: {
                    id: link.toId,
                },
            })

            if (word) {
                words.push(word.value)
            }
        }
    }

    console.log(words.join(' '))
}

main().finally(async () => await prisma.$disconnect())
