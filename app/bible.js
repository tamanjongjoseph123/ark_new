import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BibleScreen = () => {
    const [books, setBooks] = useState([]);
    const [selectedBook, setSelectedBook] = useState(null);
    const [selectedChapter, setSelectedChapter] = useState(null);
    const [selectedVerse, setSelectedVerse] = useState(null);
    const [verses, setVerses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [favorites, setFavorites] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const verseListRef = React.useRef(null);

    // API Key for Bible API (you'll need to get your own from https://scripture.api.bible/)
    const API_KEY = 'f7f438686469233777ca569b3cb635a0';
    const BIBLE_ID = 'de4e12af7f28f599-02'; // English version

    useEffect(() => {
        fetchBooks();
        loadFavorites();
    }, []);

    useEffect(() => {
        if (selectedVerse) {
            scrollToSelectedVerse();
        }
    }, [selectedVerse]);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`https://api.scripture.api.bible/v1/bibles/${BIBLE_ID}/books`, {
                headers: {
                    'api-key': API_KEY
                }
            });
            // Fetch chapter count for each book
            const booksWithChapters = await Promise.all(
                response.data.data.map(async (book) => {
                    const chaptersResponse = await axios.get(
                        `https://api.scripture.api.bible/v1/bibles/${BIBLE_ID}/books/${book.id}/chapters`,
                        {
                            headers: {
                                'api-key': API_KEY
                            }
                        }
                    );
                    return {
                        ...book,
                        chapters: chaptersResponse.data.data.length - 1 // Subtract 1 because the API includes an "intro" chapter
                    };
                })
            );
            setBooks(booksWithChapters);
        } catch (error) {
            console.error('Error fetching books:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchChapterVerses = async (bookId, chapterNumber) => {
        try {
            setLoading(true);
            const response = await axios.get(
                `https://api.scripture.api.bible/v1/bibles/${BIBLE_ID}/passages/${bookId}.${chapterNumber}`,
                {
                    headers: {
                        'api-key': API_KEY,
                        'accept': 'application/json'
                    },
                    params: {
                        'content-type': 'text',
                        'include-verse-numbers': true
                    }
                }
            );
            
            // Process the response to create verse objects
            const content = response.data.data.content;
            const verseMatches = content.match(/\[(\d+)\](.*?)(?=\[\d+\]|$)/g) || [];
            
            const verses = verseMatches.map(match => {
                const number = match.match(/\[(\d+)\]/)[1];
                const text = match.replace(/\[\d+\]/, '').trim();
                return {
                    id: `${bookId}.${chapterNumber}.${number}`,
                    number: number,
                    text: text
                };
            });
            
            console.log('Processed verses:', verses); // Debug log
            setVerses(verses);
        } catch (error) {
            console.error('Error fetching verses:', error);
            console.error('Error details:', error.response?.data); // Debug log
        } finally {
            setLoading(false);
        }
    };

    const loadFavorites = async () => {
        try {
            const savedFavorites = await AsyncStorage.getItem('bibleFavorites');
            if (savedFavorites) {
                setFavorites(JSON.parse(savedFavorites));
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
        }
    };

    const toggleFavorite = async (verse) => {
        try {
            const newFavorites = favorites.includes(verse.id)
                ? favorites.filter(id => id !== verse.id)
                : [...favorites, verse.id];
            setFavorites(newFavorites);
            await AsyncStorage.setItem('bibleFavorites', JSON.stringify(newFavorites));
        } catch (error) {
            console.error('Error saving favorite:', error);
        }
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);
        
        if (query.length < 2) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        try {
            setIsSearching(true);
            const response = await axios.get(
                `https://api.scripture.api.bible/v1/bibles/${BIBLE_ID}/search`,
                {
                    headers: {
                        'api-key': API_KEY,
                        'accept': 'application/json'
                    },
                    params: {
                        query: query,
                        limit: 20,
                        sort: 'relevance',
                        'include-verse-numbers': true
                    }
                }
            );
            
            console.log('Search response:', response.data); // Debug log

            if (response.data.data && response.data.data.verses) {
                const formattedResults = response.data.data.verses.map(verse => ({
                    id: verse.id,
                    reference: verse.reference,
                    text: verse.text,
                    bookId: verse.bookId,
                    chapterId: verse.chapterId,
                    verseNumber: verse.verseNumber
                }));

                console.log('Formatted results:', formattedResults); // Debug log
                setSearchResults(formattedResults);
            } else {
                console.log('No verses in response:', response.data); // Debug log
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Search error:', error);
            console.error('Error details:', error.response?.data); // Debug log
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchResultPress = (result) => {
        const [book, chapter, verse] = result.reference.split(' ')[1].split(':');
        const selectedBook = books.find(b => b.name === book);
        
        if (selectedBook) {
            setSelectedBook(selectedBook);
            setSelectedChapter(parseInt(chapter));
            fetchChapterVerses(selectedBook.id, chapter).then(() => {
                const selectedVerse = verses.find(v => v.number === verse);
                if (selectedVerse) {
                    setSelectedVerse(selectedVerse);
                }
            });
        }
    };

    const scrollToSelectedVerse = () => {
        if (selectedVerse && verseListRef.current) {
            setTimeout(() => {
                verseListRef.current.scrollTo({
                    y: (selectedVerse.number - 1) * 100,
                    animated: true
                });
            }, 100);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Holy Bible</Text>
                <Text style={styles.subtitle}>Your daily bread for spiritual growth</Text>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#AAA" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search scripture..."
                        value={searchQuery}
                        onChangeText={handleSearch}
                        placeholderTextColor="#AAA"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity 
                            onPress={() => {
                                setSearchQuery('');
                                setSearchResults([]);
                            }}
                            style={styles.clearButton}
                        >
                            <Ionicons name="close-circle" size={20} color="#AAA" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={styles.content}>
                {searchQuery.length > 0 ? (
                    <View style={styles.searchResults}>
                        {isSearching ? (
                            <ActivityIndicator size="large" color="#4A4A4A" style={styles.searchLoader} />
                        ) : searchResults.length > 0 ? (
                            <ScrollView>
                                {searchResults.map((result, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.searchResultItem}
                                        onPress={() => handleSearchResultPress(result)}
                                    >
                                        <Text style={styles.searchResultReference}>
                                            {result.reference}
                                        </Text>
                                        <Text style={styles.searchResultText} numberOfLines={2}>
                                            {result.text}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        ) : (
                            <View style={styles.noResultsContainer}>
                                <Text style={styles.noResultsText}>
                                    No results found for "{searchQuery}"
                                </Text>
                            </View>
                        )}
                    </View>
                ) : !selectedBook ? (
                    <>
                        <Text style={styles.instructionText}>Select a Book</Text>
                        <ScrollView style={styles.bookList}>
                            {books.map((book) => (
                                <TouchableOpacity
                                    key={book.id}
                                    style={styles.bookItem}
                                    onPress={() => setSelectedBook(book)}
                                >
                                    <View style={styles.bookItemContent}>
                                        <Text style={styles.bookName}>{book.name}</Text>
                                        <Text style={styles.chapterCount}>{book.chapters} chapters</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#4A4A4A" />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </>
                ) : !selectedChapter ? (
                    <View style={styles.chapterGrid}>
                        <View style={styles.navigationHeader}>
                            <TouchableOpacity 
                                style={styles.backButton}
                                onPress={() => setSelectedBook(null)}
                            >
                                <Ionicons name="arrow-back" size={24} color="#4A4A4A" />
                                <Text style={styles.backButtonText}>Books</Text>
                            </TouchableOpacity>
                            <Text style={styles.selectedBookName}>{selectedBook.name}</Text>
                        </View>
                        <Text style={styles.instructionText}>Select a Chapter</Text>
                        <ScrollView>
                            <View style={styles.chaptersContainer}>
                                {[...Array(selectedBook.chapters)].map((_, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.chapterButton}
                                        onPress={() => {
                                            setSelectedChapter(index + 1);
                                            fetchChapterVerses(selectedBook.id, index + 1);
                                        }}
                                    >
                                        <Text style={styles.chapterNumber}>{index + 1}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                ) : !selectedVerse ? (
                    <View style={styles.versesContainer}>
                        <View style={styles.navigationHeader}>
                            <TouchableOpacity 
                                style={styles.backButton}
                                onPress={() => setSelectedChapter(null)}
                            >
                                <Ionicons name="arrow-back" size={24} color="#4A4A4A" />
                                <Text style={styles.backButtonText}>Chapters</Text>
                            </TouchableOpacity>
                            <Text style={styles.selectedBookName}>
                                {selectedBook.name} {selectedChapter}
                            </Text>
                        </View>
                        <Text style={styles.instructionText}>Select a Verse</Text>
                        {loading ? (
                            <ActivityIndicator size="large" color="#4A4A4A" />
                        ) : verses.length === 0 ? (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>No verses found for {selectedBook.name} chapter {selectedChapter}</Text>
                                <TouchableOpacity 
                                    style={styles.retryButton}
                                    onPress={() => fetchChapterVerses(selectedBook.id, selectedChapter)}
                                >
                                    <Text style={styles.retryButtonText}>Retry</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <ScrollView>
                                <View style={styles.chaptersContainer}>
                                    {verses.map((verse) => (
                                        <TouchableOpacity
                                            key={verse.id}
                                            style={styles.chapterButton}
                                            onPress={() => setSelectedVerse(verse)}
                                        >
                                            <Text style={styles.chapterNumber}>{verse.number}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        )}
                    </View>
                ) : (
                    <View style={styles.versesContainer}>
                        <View style={styles.navigationHeader}>
                            <TouchableOpacity 
                                style={styles.backButton}
                                onPress={() => setSelectedVerse(null)}
                            >
                                <Ionicons name="arrow-back" size={24} color="#4A4A4A" />
                                <Text style={styles.backButtonText}>Verses</Text>
                            </TouchableOpacity>
                            <Text style={styles.selectedBookName}>
                                {selectedBook.name} {selectedChapter}:{selectedVerse.number}
                            </Text>
                        </View>
                        <ScrollView 
                            ref={verseListRef}
                            style={styles.versesList}
                        >
                            {verses.map((verse) => (
                                <View 
                                    key={verse.id} 
                                    style={[
                                        styles.verseItem,
                                        verse.id === selectedVerse.id && styles.selectedVerseItem
                                    ]}
                                >
                                    <Text style={styles.verseNumber}>{verse.number}</Text>
                                    <Text style={[
                                        styles.verseText,
                                        verse.id === selectedVerse.id && styles.selectedVerseText
                                    ]}>
                                        {verse.text}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => toggleFavorite(verse)}
                                        style={styles.favoriteButton}
                                    >
                                        <Ionicons
                                            name={favorites.includes(verse.id) ? "heart" : "heart-outline"}
                                            size={20}
                                            color="#D8C9AE"
                                        />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
    },
    header: {
        backgroundColor: '#1e67cd',
        padding: 20,
        paddingTop: 40,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    title: {
        fontSize: 28,
        color: '#FFF',
        fontWeight: 'bold',
        marginBottom: 15,
    },
    subtitle: {
        fontSize: 16,
        color: '#FFF',
        marginBottom: 15,
        fontStyle: 'italic',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 25,
        paddingHorizontal: 15,
        marginTop: 10,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: 40,
        fontSize: 16,
        color: '#4A4A4A',
    },
    content: {
        flex: 1,
        padding: 15,
    },
    bookList: {
        flex: 1,
    },
    bookItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#FFF',
        marginBottom: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    bookItemContent: {
        flex: 1,
    },
    bookName: {
        fontSize: 16,
        color: '#4A4A4A',
        fontWeight: '500',
    },
    chapterCount: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
    navigationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        padding: 10,
    },
    selectedBookName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 15,
        color: '#4A4A4A',
    },
    chaptersContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        padding: 10,
    },
    chapterButton: {
        width: '23%',
        aspectRatio: 1,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '1%',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    chapterNumber: {
        fontSize: 18,
        fontWeight: '500',
        color: '#4A4A4A',
    },
    versesContainer: {
        flex: 1,
    },
    versesList: {
        flex: 1,
    },
    verseItem: {
        flexDirection: 'row',
        padding: 15,
        backgroundColor: '#FFF',
        marginBottom: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    verseNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e67cd',
        marginRight: 10,
        minWidth: 30,
    },
    verseText: {
        flex: 1,
        fontSize: 16,
        color: '#4A4A4A',
        lineHeight: 24,
    },
    favoriteButton: {
        padding: 5,
    },
    instructionText: {
        fontSize: 18,
        color: '#FFF',
        fontWeight: '500',
        marginBottom: 15,
        textAlign: 'center',
        backgroundColor: '#1e67cd',
        padding: 10,
        borderRadius: 8,
        marginHorizontal: 10,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    backButtonText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#4A4A4A',
        fontWeight: '500',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#1e67cd',
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#4A4A4A',
        fontWeight: '500',
    },
    searchResults: {
        flex: 1,
        backgroundColor: '#fff',
    },
    searchLoader: {
        marginTop: 20,
    },
    searchResultItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    searchResultReference: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4A4A4A',
        marginBottom: 5,
    },
    searchResultText: {
        fontSize: 14,
        color: '#666',
    },
    noResultsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    noResultsText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    clearButton: {
        padding: 5,
    },
    selectedVerseItem: {
        backgroundColor: '#e6eef9',
    },
    selectedVerseText: {
        fontWeight: '500',
    },
});

export default BibleScreen;
