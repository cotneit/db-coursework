DROP TRIGGER IF EXISTS add_book;

DROP TABLE IF EXISTS customer_waits_book;
DROP TABLE IF EXISTS customer_likes_genre;
DROP TABLE IF EXISTS book_is_genre;


DROP TABLE IF EXISTS price;
DROP TABLE IF EXISTS quantity;
DROP TABLE IF EXISTS genre;
DROP TABLE IF EXISTS book;
DROP TABLE IF EXISTS customer;

CREATE TABLE book (
  [id] INTEGER PRIMARY KEY,
  [title] TEXT NOT NULL,
  [author] TEXT NOT NULL,
  [year] INTEGER NOT NULL CHECK (typeof([year]) = 'integer'),
  [description] TEXT
);

CREATE TABLE genre (
  [id] INTEGER PRIMARY KEY,
  [name] TEXT NOT NULL
);

CREATE TABLE quantity (
  [book_id] INTEGER UNIQUE,
  [available] INTEGER NOT NULL DEFAULT 0 CHECK (typeof([available]) = 'integer'),
  [sold] INTEGER NOT NULL DEFAULT 0 CHECK (typeof([sold]) = 'integer'),
  FOREIGN KEY ([book_id]) REFERENCES book([id]) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE price (
  [book_id] INTEGER UNIQUE,
  [price] REAL CHECK (typeof([price]) in ('real', 'null')),
  FOREIGN KEY ([book_id]) REFERENCES book([id]) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE customer (
  [id] INTEGER PRIMARY KEY,
  [first_name] TEXT,
  [last_name] TEXT,
  [email] TEXT,
  [phone_number] TEXT
);

CREATE TABLE book_is_genre (
  [book_id] INTEGER,
  [genre_id] INTEGER,
  FOREIGN KEY ([book_id]) REFERENCES book([id]) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ([genre_id]) REFERENCES genre([id]) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE customer_likes_genre (
  [customer_id] INTEGER,
  [genre_id] INTEGER,
  FOREIGN KEY ([customer_id]) REFERENCES customer([id]) ON DELETE CASCADE ON UPDATE CASCADE
  FOREIGN KEY ([genre_id]) REFERENCES genre([id]) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE customer_waits_book (
  [customer_id] INTEGER,
  [book_id] INTEGER,
  FOREIGN KEY ([customer_id]) REFERENCES customer([id]) ON DELETE CASCADE ON UPDATE CASCADE
  FOREIGN KEY ([book_id]) REFERENCES book([id]) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TRIGGER add_book
  AFTER INSERT ON book
BEGIN
  INSERT INTO
    quantity ([book_id])
  VALUES
    (NEW.[id]);

  INSERT INTO
    price ([book_id])
  VALUES
    (NEW.[id]);
END;

INSERT INTO
  genre ([id], [name])
VALUES
  (1, 'Drama'),
  (2, 'Fiction'),
  (3, 'Science fiction'),
  (4, 'Fantasy'),
  (5, 'Dystopian'),
  (6, 'Action'),
  (7, 'Adventure'),
  (8, 'Mystery'),
  (9, 'Horror'),
  (10, 'Thriller'),
  (11, 'Romance'),
  (12, 'Biography'),
  (13, 'History'),
  (14, 'Crime'),
  (15, 'Travel'),
  (16, 'Humor'),
  (17, 'Comedy');

-- Id is autoincremented on insertion
INSERT INTO
  book ([title], [author], [year], [description])
VALUES
  ('Harry Potter and the Philosopher''s Stone', 'J. K. Rowling', 1997, 'Harry Potter has never played a sport while flying on a broomstick. He''s never worn a Cloak of Invisibility, befriended a half-giant, or helped hatch a dragon. All Harry knows is a miserable life with the Dursleys: his horrible aunt and uncle and their abominable son, Dudley. Harry''s room is a tiny Cupboard Under the Stairs, he hasn''t had a birthday party in ten years, and his birthday present is his uncle''s old socks.
But all that is about to change when a mysterious letter arrives by owl messenger. A letter with an invitation to a wonderful place he never dreamed existed. There he finds not only friends, aerial sports, and magic around every corner, but a great destiny that''s been waiting for him... if Harry can survive the encounter.'),
  ('Harry Potter and the Chamber of Secrets', 'J. K. Rowling', 1998, 'Ever since Harry Potter had come home for the summer, the Dursleys had been so mean and hideous that all Harry wanted was to get back to the Hogwarts School of Witchcraft and Wizardry. But just as he is packing his bags, Harry receives a warning from a strange impish creature who says that if Harry returns to Hogwarts, disaster will strike.'),
  ('Harry Potter and the Prisoner of Azkaban', 'J. K. Rowling', 1999, 'Harry Potter is lucky to reach the age of thirteen, since he has already survived the murderous attacks of the feared Dark Lord on more than one occasion. But his hopes for a quiet term concentrating on Quidditch are dashed when a maniacal mass-murderer escapes from Azkaban, pursued by the soul-sucking Dementors who guard the prison. It''s assumed that Hogwarts is the safest place for Harry to be. But is it a coincidence that he can feel eyes watching him in the dark, and should he be taking Professor Trelawney''s ghoulish predictions seriously?'),
  ('Harry Potter and the Goblet of Fire', 'J. K. Rowling', 2000, 'Harry Potter is in his fourth year at Hogwarts. Harry wants to get away from the pernicious Dursleys and go to the Quidditch World Cup with Hermione, Ron, and the Weasleys. He wants to find out about the mysterious event to take place at Hogwarts this year, an event involving two other rival schools of magic, and a competition that hasn''t happened for hundreds of years. He wants to be a normal, fourteen-year-old wizard. But unfortunately for Harry Potter, he''s not normal - not even by Wizarding standards. And in his case, different can be deadly.'),
  ('Harry Potter and the Order of the Phoenix', 'J. K. Rowling', 2003, 'Harry is in his fifth year at Hogwarts School as the adventures continue. There is a door at the end of a silent corridor. And it''s haunting Harry Potter''s dreams. Why else would he be waking in the middle of the night, screaming in terror? Harry has a lot on his mind for this, his fifth year at Hogwarts: a Defence Against the Dark Arts teacher with a personality like poisoned honey; a big surprise on the Gryffindor Quidditch team; and the looming terror of the Ordinary Wizarding Level exams.'),
  ('Harry Potter and the Half-Blood Prince', 'J. K. Rowling', 2005, 'It is Harry Potter''s sixth year at Hogwarts School of Witchcraft and Wizardry. As Voldemort''s sinister forces amass and a spirit of gloom and fear sweeps the land, it becomes more and more clear to Harry that he will soon have to confront his destiny. But is he up to the challenges ahead of him?'),
  ('Harry Potter and the Deathly Hallows', 'J. K. Rowling', 2007, 'Harry is waiting in Privet Drive. The Order of the Phoenix is coming to escort him safely away without Voldemort and his supporters knowing - if they can. But what will Harry do then? How can he fulfil the momentous and seemingly impossible task that Professor Dumbledore has left him?'),
  ('Six of Crows', 'Leigh Bardugo', 2015, 'Ketterdam: a bustling hub of international trade where anything can be had for the right price—and no one knows that better than criminal prodigy Kaz Brekker. Kaz is offered a chance at a deadly heist that could make him rich beyond his wildest dreams. But he can''t pull it off alone...'),
  ('Crooked Kingdom', 'Leigh Bardugo', 2016, 'Kaz Brekker and his crew have just pulled off a heist so daring, even they didn''t think they''d survive. But instead of divvying up a fat reward, they''re right back to fighting for their lives. Double-crossed and left crippled by the kidnapping of a valuable team member, the crew is low on resources, allies, and hope.'),
  ('Shadow and Bone', 'Leigh Bardugo', 2012, 'The Shadow Fold, a swathe of impenetrable darkness crawling with monsters that feast on human flesh, is slowly destroying the once-great nation of Ravka.
Alina, a pale, lonely orphan, discovers a unique power that thrusts her into the lavish world of the kingdom’s magical elite—the Grisha. Could she be the key to unravelling the dark fabric of the Shadow Fold and setting Ravka free?'),
  ('Siege and Storm', 'Leigh Bardugo', 2013, 'Hunted across the True Sea, haunted by the lives she took on the Fold, Alina Starkov must try to make a life with Mal in an unfamiliar land. She finds starting new is not easy while keeping her identity as the Sun Summoner a secret. She can’t outrun her past or her destiny for long.'),
  ('Ruin and Rising', 'Leigh Bardugo', 2014, 'The capital has fallen. The Darkling rules Ravka from his shadow throne.
Now the nation''s fate rests with a broken Sun Summoner, a disgraced tracker, and the shattered remnants of a once-great magical army.
Deep in an ancient network of tunnels and caverns, a weakened Alina must submit to the dubious protection of the Apparat and the zealots who worship her as a Saint. Yet her plans lie elsewhere, with the hunt for the elusive firebird and the hope that an outlaw prince still survives.'),
  ('King of Scars', 'Leigh Bardugo', 2019, 'First book in the King of Scars Duology. Face your demons... or feed them.
Nikolai Lantsov has always had a gift for the impossible. No one knows what he endured in his country''s bloody civil war—and he intends to keep it that way. Now, as enemies gather at his weakened borders, the young king must find a way to refill Ravka''s coffers, forge new alliances, and stop a rising threat to the once-great Grisha Army.'),
  ('Rule of Wolves', 'Leigh Bardugo', 2021, 'The wolves are circling and a young king will face his greatest challenge in the explosive finale of the instant #1 New York Times-bestselling King of Scars Duology.');


INSERT INTO
  book_is_genre ([book_id], [genre_id])
VALUES
  (1, 1),
  (1, 2),
  (1, 4),
  (1, 8),
  (1, 10),
  (2, 1),
  (2, 2),
  (2, 4),
  (2, 8),
  (2, 10),
  (3, 1),
  (3, 2),
  (3, 4),
  (3, 8),
  (3, 10),
  (4, 1),
  (4, 2),
  (4, 4),
  (4, 8),
  (4, 10);

-- UPSERT https://stackoverflow.com/questions/2717590/sqlite-insert-on-duplicate-key-update-upsert
INSERT INTO
  quantity ([book_id], [available], [sold])
VALUES
  (1, 20, 140),
  (2, 14, 84),
  (3, 25, 119),
  (4, 9, 100)

ON CONFLICT ([book_id])
DO UPDATE SET
  [available] = excluded.[available],
  [sold] = excluded.[sold];

INSERT INTO
  price ([book_id], [price])
VALUES
  (1, 9.99),
  (2, 9.99),
  (3, 9.99),
  (4, 9.99)
ON CONFLICT ([book_id])
DO UPDATE SET
  [price] = excluded.[price];
