import { upload } from './upload.js'
import { initializeApp } from 'firebase/app'
import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
} from 'firebase/storage'

const firebaseConfig = {
    apiKey: 'AIzaSyDdneEiK6z5b4AOFYoDqTvR44QU-CwuRGQ',
    authDomain: 'file-uploader-a71ac.firebaseapp.com',
    projectId: 'file-uploader-a71ac',
    storageBucket: 'file-uploader-a71ac.appspot.com',
    messagingSenderId: '977197072746',
    appId: '1:977197072746:web:43309dfa5391e666bba513',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

const storage = getStorage()

upload('#file', {
    multi: true,
    accept: ['.png', '.jpg', '.jpeg', '.gif'],
    onUpload(files, blocks) {
        files.forEach((file, index) => {
            const storageRef = ref(storage, `images/${file.name}`)
            const task = uploadBytesResumable(storageRef, file)
            task.on(
                'state_changed',
                snapshot => {
                    const persentage =
                        (
                            (snapshot.bytesTransferred /
                                snapshot.totalBytes) *
                            100
                        ).toFixed(0) + '%'

                    const block = blocks[index].querySelector(
                        '.preview-info-progress'
                    )
                    block.textContent = persentage + '%'
                    block.style.width = persentage
                },
                error => {
                    console.log(error)
                },
                () => {
                    const pUrl = getDownloadURL(storageRef)
                    pUrl.then(info =>
                        console.log(
                            'The url for ' + file.name + ' is ' + info
                        )
                    )
                }
            )
        })
    },
})
