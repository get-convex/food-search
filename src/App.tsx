import { FormEvent, useState, useRef, useCallback, ChangeEvent } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SearchResult } from "../convex/vectorDemo";
import { CUISINES } from "../convex/constants";
import { Tab } from "@headlessui/react";

function presentCuisine(name: string, emoji: string) {
  return `${emoji} ${name[0].toUpperCase()}${name.slice(1)}`;
}

function Insert() {
  const [description, setDescription] = useState("");
  const [cuisine, setCuisine] = useState("american");
  const [insertInProgress, setInsertInProgress] = useState(false);
  const insert = useAction(api.vectorDemo.insert);

  async function handleInsert(event: FormEvent) {
    event.preventDefault();
    setInsertInProgress(true);
    try {
      await insert({ description, cuisine });
      setDescription("");
      setCuisine("");
    } finally {
      setInsertInProgress(false);
    }
  }
  return (
    <>
      <form className="add-form" onSubmit={handleInsert}>
        <input
          type="text"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Description"
        />
        <select value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
          {Object.entries(CUISINES).map(([c, e]) => (
            <option key={c} value={c}>
              {presentCuisine(c, e)}
            </option>
          ))}
        </select>
        <button type="submit" disabled={!description || insertInProgress}>
          Insert
        </button>
      </form>
    </>
  );
}

function Populate() {
  const [submitted, setSubmitted] = useState(false);
  const populate = useAction(api.vectorDemo.populate);

  return (
    <div className="populate">
      <p>No entries yet.</p>
      <button
        type="submit"
        onClick={() => {
          setSubmitted(true);
          populate();
        }}
        disabled={submitted}
      >
        Populate test data
      </button>
    </div>
  );
}

function Loading() {
  return <div className="loading">Loading…</div>;
}

function List() {
  const entries = useQuery(api.vectorDemo.list);

  return (
    <>
      <header>
        <h1>All dishes</h1>
      </header>

      <Insert />

      {entries === undefined && <Loading />}

      {entries !== undefined && entries.length === 0 && <Populate />}

      {entries?.map((entry) => (
        <Dish key={entry._id} {...entry} />
      ))}
    </>
  );
}

function Search() {
  const [searchText, setSearchText] = useState("");
  const [searchFilter, setSearchFilter] = useState<string[]>(
    Object.keys(CUISINES)
  );
  const [searchResults, setSearchResults] = useState<
    SearchResult[] | undefined
  >();
  const [searchInProgress, setSearchInProgress] = useState(false);

  const search = useAction(api.vectorDemo.search);
  const handleSearch = async (event: FormEvent) => {
    event.preventDefault();
    setSearchResults(undefined);
    if (!searchText) {
      return;
    }
    setSearchInProgress(true);
    try {
      const results = await search({
        query: searchText,
        cuisines: searchFilter.length > 0 ? searchFilter : undefined,
      });
      setSearchResults(results);
    } finally {
      setSearchInProgress(false);
    }
  };
  return (
    <>
      <header>
        <h1>Search dishes</h1>
      </header>

      <form className="search-form" onSubmit={handleSearch}>
        <input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Query"
        />

        <div className="pills">
          {Object.entries(CUISINES).map(([c, e]) => (
            <label className={searchFilter.includes(c) ? "pill-selected" : ""}>
              <input
                type="checkbox"
                checked={searchFilter.includes(c)}
                onChange={() => {
                  const index = searchFilter.indexOf(c);
                  if (index === -1) {
                    setSearchFilter([...searchFilter, c]);
                  } else {
                    const newValue = [...searchFilter];
                    newValue.splice(index, 1);
                    setSearchFilter(newValue);
                  }
                }}
              />
              {presentCuisine(c, e)}
            </label>
          ))}
        </div>
        <button type="submit" disabled={!searchText || searchInProgress}>
          Search
        </button>
      </form>
      {searchResults !== undefined &&
        searchResults.map((result) => <Dish key={result._id} {...result} />)}
    </>
  );
}

export function Dish({
  _id,
  description,
  cuisine,
  score,
}: {
  _id: string;
  description: string;
  cuisine: string;
  score?: number;
}) {
  return (
    <article>
      <h3>
        <span>{CUISINES[cuisine as keyof typeof CUISINES]}</span>
        {cuisine}
      </h3>
      {score !== undefined && <span className="score">{score.toFixed(4)}</span>}
      <p>{description}</p>
    </article>
  );
}

export default function App() {
  return (
    <div className="app">
      <Tab.Group>
        <Tab.Panels>
          <Tab.Panel>
            <List />
          </Tab.Panel>
          <Tab.Panel>
            <Search />
          </Tab.Panel>
        </Tab.Panels>
        <Tab.List className="tabs">
          <Tab>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
            Dishes
          </Tab>
          <Tab>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            Search
          </Tab>
        </Tab.List>
      </Tab.Group>
    </div>
  );
}
