import React, { Component, ChangeEvent, MouseEvent } from "react";
import { Container, InputGroup, FormControl, Button, Row, Col, Card } from 'react-bootstrap';
import { Root } from "react-dom/client";
import './index.css';
import SearchBar from "./SearchBar";


// const CLIENT_ID = "e910cd42af954cd39b2e04cb4a1a43c3";
// const CLIENT_SECRET = "2e5b8f0e3f464084bd3546d5dad312c5";


// INTERFACES
type Song = {
    name: string,
    image: any,
    id: string
}

type SongMatchProps = {
    // Initial State of the File (props we are passing into this component)
   

    // Callback buttons to pass back information as props
    onBack: () => void;
}


type SongMatchState = {
    // search bar content
    currentSearch: string;
    currentPage: "home" | "searchbar" | "songlist" | "recommendations" | "playlist";
    errorMessage: string;
    songResults: any[]; // current list of diplayed songs
    // songMatchList: {name: string, image: any, id: string}; // list of song IDs
    songMatchList: Song[];

    // match pool content
    
}


export class SongMatch extends Component<SongMatchProps, SongMatchState> {

    constructor(props: SongMatchProps) {

        super(props);

        this.state = {
            currentSearch: "test",
            currentPage: "home",
            errorMessage: "",
            songResults: [],
            songMatchList: []
            
        }
    }
    


    render = (): JSX.Element => {
        

        // if we're on start page
        if (this.state.currentPage === "home") {
            // render start page
            return (
                <div className="background">
                    {this.renderStartPage()}
                </div>
            );
        } else if (this.state.currentPage === "searchbar") {
            return (
                <SearchBar/>
            )

        } else if (this.state.currentPage === "songlist") {
            
            return(
                <div/>
            )
            
        } else {
            return (
                <div>other page</div>
            );
        }


    }


    renderStartPage = (): JSX.Element => {
        return (
            <div className="App">
                <Container>
                    <InputGroup className="mb-3" size="lg">
                    <FormControl
                        placeholder="Search for Artist"
                        type="input"
                        onKeyUp={event => {
                        if (event.key === "Enter") {
                            this.searchSong();
                        }
                        }}
                        onChange={this.doSearchChange}
                    />
                    <Button onClick={() => this.searchSong()}>
                        Search
                    </Button>

                    <button onClick={this.doBackClick}>Back</button>
                    </InputGroup>
                </Container>

                {/* <Container>
                    <Row className="mx-2 row row-cols-6">
                    
                    {this.state.songResults.map( (song, i) => {
                        return (
                        <Card>
                            <Card.Img src={song.images[0].url}/>
                            <Card.Body>
                            <Card.Title>{song.name}</Card.Title>
                            </Card.Body>
                        </Card>
                        )
                    })}
            
                    </Row>
                </Container> */}

                <Container>
                    <Row className="mx-2 row row-cols-6">
                    
                        {this.state.songResults.map( (song, i) => {
                            return (
                            <Card>
                                <Card.Img src={song.album.images[0].url}/>
                                <Card.Body>
                                <Card.Title>{song.name}</Card.Title>
                                <button onClick={() => this.doAddSong(song.name, song.album.images[0].url, song.id)}> + </button>
                                </Card.Body>
                            </Card>
                            )
                        })}
                    </Row>
                </Container>


                <Container className="mt-3">
                    <Row>
                        {this.state.songMatchList.map( (song, i) => {
                            return (
                            <Col md={2}>
                                <Card className="small-card">
                                    <Card.Img src={song.image}/>
                                    <Card.Body>
                                    <Card.Title>{song.name}</Card.Title>
                                    </Card.Body>
                                </Card>
                            </Col>
                            )
                        })}
                    </Row>

                    {this.state.songMatchList.length > 0 && <Button onClick={this.doSearchRecs}>Search</Button>}
                </Container>
                
                


                </div>
        )
    }


    /**
     * SEARCH BAR TESTING
     */
    doSearchBarClick = (_evt: MouseEvent<HTMLButtonElement>): void => {
        this.setState({currentPage: "searchbar"})
    }

    /**
     * BACK BUTTON HANDLER FUNCTIONS
     */
    doBackClick = (_evt: MouseEvent<HTMLButtonElement>): void => {
        return this.props.onBack();
    }



    /**
     * SEARCH BAR HANDLER FUNCTIONS
     */

    // updates search value
    doSearchChange = (evt: ChangeEvent<HTMLInputElement>): void => {
        this.setState( {currentSearch: evt.target.value});
    }

    // searchs song (calls sppotify api to find songs)
    doSearchClick = (_evt: MouseEvent<HTMLButtonElement>): void => {
        // if the search bar is empty
        if (this.state.currentSearch === undefined || this.state.currentSearch === "") {
            //show error message saying they need to type something in the search bar
            this.setState({errorMessage: "Please enter a Song in the Search Bar"});

        } else {    // searchbar is not empty, SEARCH
            // run the api call
            this.searchSong();
        }

    }

    /**
     * Song List Management
     */

    doAddSong = (name: string, image: any, id: string ): void => {
        // add song to state array (songMatchList)
        
        const currList = this.state.songMatchList;
        currList.push({name: name, image: image, id: id});
        this.setState({songMatchList: currList});
    }


    searchSong = async (): Promise<void> => {
        const CLIENT_ID = "e910cd42af954cd39b2e04cb4a1a43c3";
        const CLIENT_SECRET = "2e5b8f0e3f464084bd3546d5dad312c5";

        // API Access Token
        var authParameters = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET
        }
        // call to get token, and update value
        const result = await fetch('https://accounts.spotify.com/api/token', authParameters);
        const data = await result.json();
        const accessToken = data.access_token;

        // GET request using Search to get Artist ID
        var searchParameters = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + accessToken
            }
        }
        var songID = await fetch('https://api.spotify.com/v1/search?q=' + this.state.currentSearch + '&type=track&limit=10', searchParameters)
            .then(response => response.json())
            // .then(data => console.log(data))  // FOR QUERY TESTING
            .then(data => {this.setState({songResults: data.tracks.items})})

    }





    /**
     * New Song Search
     */
    doSearchRecs = (): void => {

        // call generation of recs (3-5?).


        // store recs they chose



    }



    /**
     * Search AFTER choosing Recs
     */
    doCreatePlaylist = (): void => {

        // search for songs based on the recommendation(s) they chose


        // create playlist



        // auth + spotify login
    }


}



