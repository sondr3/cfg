import type { NextPage } from "next"
import Head from "next/head"
import { Disclosure, Switch } from "@headlessui/react"
import { MenuIcon, XIcon } from "@heroicons/react/outline"
import { Graph } from "@/components"
import { useState } from "react"
import { buildGraph, parse, constructCFG } from "cfg-lib"
import { Elements } from "react-flow-renderer"

const navigation = [{ name: "Home", href: "/", current: true }]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}

const defaultJava = `class Test {
  private void main() {
    if (4 > 2) {
    } else {
    }
  }
}`

const Home: NextPage = () => {
  const [language, setLanguage] = useState<"java" | "javascript">("java")
  const [text, setText] = useState(defaultJava)
  const [elements, setElements] = useState<Elements>(buildGraph(constructCFG(parse(language, text))))

  const onChange = (value: string) => {
    setText(value)
    setElements(buildGraph(constructCFG(parse(language, value))))
  }

  const changeLanguage = () => {
    setLanguage(language === "java" ? "javascript" : "java")
    onChange(text)
  }

  return (
    <>
      <Head>
        <title>Control flow graphs</title>
      </Head>
      <div className="min-h-full">
        <Disclosure as="nav" className="bg-white border-b border-gray-200">
          {({ open }) => (
            <>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                  <div className="flex">
                    <div className="flex-shrink-0 flex items-center">
                      <h1 className="font-semibold text-lg text-gray-800">Control flow graphs</h1>
                    </div>
                    <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                      {navigation.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          className={classNames(
                            item.current
                              ? "border-indigo-500 text-gray-900"
                              : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                            "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                          )}
                          aria-current={item.current ? "page" : undefined}
                        >
                          {item.name}
                        </a>
                      ))}
                    </div>
                  </div>
                  <div className="-mr-2 flex items-center sm:hidden">
                    {/* Mobile menu button */}
                    <Disclosure.Button className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XIcon className="block h-6 w-6" aria-hidden="true" />
                      ) : (
                        <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                      )}
                    </Disclosure.Button>
                  </div>
                </div>
              </div>

              <Disclosure.Panel className="sm:hidden">
                <div className="pt-2 pb-3 space-y-1">
                  {navigation.map((item) => (
                    <Disclosure.Button
                      key={item.name}
                      as="a"
                      href={item.href}
                      className={classNames(
                        item.current
                          ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                          : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800",
                        "block pl-3 pr-4 py-2 border-l-4 text-base font-medium",
                      )}
                      aria-current={item.current ? "page" : undefined}
                    >
                      {item.name}
                    </Disclosure.Button>
                  ))}
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        <div className="py-10">
          <main>
            <div className="mt-8 max-w-5xl mx-auto">
              <Switch.Group as="div" className="flex items-center">
                <Switch
                  checked={language === "java"}
                  onChange={changeLanguage}
                  className={classNames(
                    language === "java" ? "bg-indigo-600" : "bg-gray-200",
                    "relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={classNames(
                      language === "java" ? "translate-x-5" : "translate-x-0",
                      "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200",
                    )}
                  />
                </Switch>
                <Switch.Label as="span" className="ml-3">
                  <span className="text-sm font-medium text-gray-900 uppercase">{language}</span>
                </Switch.Label>
              </Switch.Group>
            </div>
            <div className="mt-8 max-w-5xl mx-auto">
              <div>
                <textarea
                  rows={5}
                  name="comment"
                  id="comment"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-600 rounded-md mb-4"
                  placeholder="// code here"
                  defaultValue={text}
                  onBlur={(e) => onChange(e.target.value)}
                />
              </div>
            </div>
            <div className="max-w-6xl mx-auto sm:px-6 lg:px-8 border-2 border-dashed h-screen w-screen">
              <Graph elements={elements} />
            </div>
          </main>
        </div>
      </div>
    </>
  )
}

export default Home
