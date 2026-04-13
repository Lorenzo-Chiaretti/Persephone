// server/api/pois/[id].ts
import { defineEventHandler, getRouterParam, createError } from 'h3'
import fs from 'node:fs'
import path from 'node:path'

export default defineEventHandler((event) => {
  // 1. Extract the requested ID from the URL (e.g., "laghetto-san-marco")
  const id = getRouterParam(event, 'id')

  try {
    // 2. Define the path to the JSON "database"
    // We use path.resolve to make the path absolute and more reliable
    const filePath = path.resolve('public/data/pois.json')
    
    // Check if the file actually exists before reading it
    if (!fs.existsSync(filePath)) {
      throw createError({
        statusCode: 500,
        statusMessage: "Database file (pois.json) not found on server"
      })
    }
    
    // 3. Read the file content
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    
    // 4. Parse the text into a valid JSON object
    const allPois = JSON.parse(fileContent)

    // 5. Search for the specific POI by ID
    const selectedPoi = allPois.find((poi: any) => poi.id === id)

    // 6. If the ID is not found, return a 404 error
    if (!selectedPoi) {
      throw createError({
        statusCode: 404,
        statusMessage: `POI not found with ID: ${id}`
      })
    }

    // 7. Return only the data for the selected point
    return selectedPoi

  } catch (error: any) {
    // Handle potential errors (file missing, JSON syntax, etc.)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Internal Server Error while fetching POI data"
    })
  }
})