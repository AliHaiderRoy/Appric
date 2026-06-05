"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Calendar, Clock, ArrowRight, Search } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Image from "next/image"
import Link from "next/link"
import type { SiteBlogPost } from "@/lib/cms/types"

interface BlogViewProps {
  posts: SiteBlogPost[]
}

export function BlogView({ posts }: BlogViewProps) {
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(posts.map((p) => p.category)))],
    [posts]
  )
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory
    const matchesSearch =
      searchQuery === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.excerpt ?? "").toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <main className="pt-24">
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-black to-cyan-950">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 text-balance">
                Our{" "}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Blog</span>
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed text-balance mb-8">
                Insights, tutorials, and industry trends from our team of experts.
              </p>
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-8 sticky top-20 z-40 bg-black/80 backdrop-blur-xl border-b border-white/10">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category) => (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-cyan-500/50"
                      : "bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg">No articles found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    layout
                    className="group"
                  >
                    <Link href={`/blog/${post.slug}`}>
                      <div className="bg-gradient-to-b from-white/5 to-white/0 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all h-full flex flex-col">
                        <div className="relative h-56 overflow-hidden">
                          <Image
                            src={post.image_url || "/placeholder.svg"}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                          <span className="text-xs text-cyan-400 font-semibold mb-2 uppercase tracking-wider">
                            {post.category}
                          </span>
                          <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                            {post.title}
                          </h3>
                          <p className="text-gray-400 text-sm leading-relaxed mb-4 flex-1">{post.excerpt}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-white/10">
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {post.published_at
                                ? new Date(post.published_at).toLocaleDateString()
                                : "Draft"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {post.read_time}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            Read more
                            <ArrowRight size={16} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
